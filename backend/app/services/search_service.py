import asyncio
import logging
import time
from typing import Optional, List, Dict, Any, Tuple
from decimal import Decimal
from asyncpg import Pool

from app.services.pncp_client import pncp_client
from app.services.supabase_service import supabase_service
from app.models.edital import SearchResponse, EditalSummary, Pagination, SearchMeta

logger = logging.getLogger(__name__)


def _extract_pncp_results(api_response: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract edital list from PNCP API response."""
    data = api_response.get("data") or api_response.get("content") or []
    if not isinstance(data, list):
        return []
    return data


def _deduplicate(
    supabase_results: List[Dict[str, Any]],
    pncp_results: List[Dict[str, Any]],
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Merge and deduplicate results by pncp_id.
    Returns: (merged_list, supabase_only, pncp_new)
    """
    seen: Dict[str, Dict[str, Any]] = {}

    # Cache results go first (they have full DB fields + rank)
    for item in supabase_results:
        pid = item.get("pncp_id") or item.get("numeroControlePNCP")
        if pid:
            seen[pid] = {**item, "_source": "supabase"}

    new_from_pncp: List[Dict[str, Any]] = []
    for item in pncp_results:
        pid = item.get("numeroControlePNCP")
        if not pid:
            continue
        if pid not in seen:
            seen[pid] = {**item, "_source": "pncp", "pncp_id": pid}
            new_from_pncp.append(item)

    return list(seen.values()), supabase_results, new_from_pncp


def _normalize_pncp_item(item: Dict[str, Any]) -> Dict[str, Any]:
    """Map PNCP API JSON fields to EditalSummary-compatible dict."""
    orgao = item.get("orgaoEntidade") or {}
    unidade = item.get("unidadeOrgao") or {}

    return {
        "id": None,
        "pncp_id": item.get("numeroControlePNCP"),
        "numero_compra": item.get("numeroCompra"),
        "nome_orgao": orgao.get("razaoSocial"),
        "uf": unidade.get("ufSigla"),
        "municipio_nome": unidade.get("municipioNome"),
        "modalidade_nome": item.get("modalidadeNome"),
        "objeto_compra": item.get("objetoCompra"),
        "status": None,
        "valor_total_estimado": item.get("valorTotalEstimado"),
        "data_publicacao_pncp": item.get("dataPublicacaoPncp"),
        "data_abertura_proposta": item.get("dataAberturaProposta"),
        "data_encerramento_proposta": item.get("dataEncerramentoProposta"),
        "link_edital": item.get("linkSistemaOrigem") or item.get("linkProcessoEletronico"),
        "rank": 0.0,
    }


def _normalize_for_upsert(item: Dict[str, Any]) -> Dict[str, Any]:
    """Ensure payload matches what pncp_upsert_edital() SQL function expects.

    The PNCP API changed from nested objects to flat fields:
    - modalidadeContratacao.{codigo,descricao} → modalidadeId + modalidadeNome
    - situacaoCompra.{codigo,descricao}         → situacaoCompraId + situacaoCompraNome
    """
    result = dict(item)
    if "modalidadeContratacao" not in result:
        result["modalidadeContratacao"] = {
            "codigo": str(result.get("modalidadeId", "") or ""),
            "descricao": result.get("modalidadeNome") or "",
        }
    if "situacaoCompra" not in result:
        result["situacaoCompra"] = {
            "codigo": result.get("situacaoCompraId"),
            "descricao": result.get("situacaoCompraNome") or "",
        }
    return result


def _sort_results(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Sort: rank DESC (supabase items first), then data_publicacao DESC."""
    def sort_key(item):
        rank = item.get("rank") or 0.0
        date = item.get("data_publicacao_pncp")
        if date is None:
            date_val = 0.0
        elif hasattr(date, "timestamp"):
            date_val = date.timestamp()
        else:
            try:
                from datetime import datetime
                date_val = datetime.fromisoformat(str(date).replace("Z", "+00:00")).timestamp()
            except Exception:
                date_val = 0.0
        return (-rank, -date_val)

    return sorted(items, key=sort_key)


class SearchService:
    async def search(
        self,
        pool: Pool,
        q: Optional[str] = None,
        uf: Optional[str] = None,
        modalidade: Optional[str] = None,
        status: Optional[str] = None,
        valor_min: Optional[Decimal] = None,
        valor_max: Optional[Decimal] = None,
        data_inicial: Optional[str] = None,
        data_final: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> SearchResponse:
        start = time.monotonic()
        offset = (page - 1) * page_size

        # Run Supabase and PNCP API in parallel with graceful degradation
        supabase_task = supabase_service.search(
            pool=pool,
            q=q,
            uf=uf,
            modalidade=modalidade,
            status=status,
            valor_min=valor_min,
            valor_max=valor_max,
            limit=page_size * 2,  # Fetch more to have room after dedup
            offset=offset,
        )
        pncp_task = pncp_client.search(
            q=q,
            uf=uf,
            modalidade=modalidade,
            status=status,
            valor_min=float(valor_min) if valor_min else None,
            valor_max=float(valor_max) if valor_max else None,
            data_inicial=data_inicial,
            data_final=data_final,
            page=page,
            page_size=page_size,
        )

        results = await asyncio.gather(supabase_task, pncp_task, return_exceptions=True)

        supabase_results: List[Dict[str, Any]] = []
        pncp_api_response: Dict[str, Any] = {}
        sources: List[str] = []

        if isinstance(results[0], list):
            supabase_results = results[0]
            sources.append("supabase")
        else:
            logger.warning("Supabase search failed: %s", results[0])

        if isinstance(results[1], dict):
            pncp_api_response = results[1]
            if _extract_pncp_results(pncp_api_response):
                sources.append("pncp_api")
        else:
            logger.warning("PNCP API search failed: %s", results[1])

        pncp_items = _extract_pncp_results(pncp_api_response)
        merged, _, new_from_pncp = _deduplicate(supabase_results, pncp_items)

        # Background upsert of new records (non-blocking)
        if new_from_pncp and pool:
            asyncio.create_task(
                supabase_service.bulk_upsert(pool, [_normalize_for_upsert(i) for i in new_from_pncp])
            )

        sorted_items = _sort_results(merged)

        # Determine total count
        total_items = 0
        if supabase_results:
            total_items = int(supabase_results[0].get("total_count") or 0)
        if not total_items:
            total_items = int(pncp_api_response.get("totalRegistros") or len(merged))

        # Normalize PNCP-only items before building response
        normalized: List[Dict[str, Any]] = []
        for item in sorted_items:
            if item.get("_source") == "pncp":
                normalized.append(_normalize_pncp_item(item))
            else:
                normalized.append(item)

        # Paginate the merged+sorted list
        page_items = normalized[:page_size]

        edital_list: List[EditalSummary] = []
        validation_errors = 0
        for item in page_items:
            try:
                edital_list.append(EditalSummary.model_validate(item))
            except Exception as e:
                validation_errors += 1
                logger.debug("Skipping malformed item: %s", e)

        elapsed_ms = int((time.monotonic() - start) * 1000)

        return SearchResponse(
            data=edital_list,
            pagination=Pagination(
                page=page,
                page_size=page_size,
                total_items=total_items,
                total_pages=max(1, -(-total_items // page_size)),
            ),
            meta=SearchMeta(
                sources=sources,
                cache_hit_count=len(supabase_results),
                pncp_new_count=len(new_from_pncp),
                search_time_ms=elapsed_ms,
            ),
        )


search_service = SearchService()
