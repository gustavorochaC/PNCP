import asyncio
import httpx
import logging
from typing import Optional, List, Any, Dict
from app.config import settings

logger = logging.getLogger(__name__)

PNCP_SEARCH_ENDPOINT = "/contratacoes/publicacao"

# Modalidades mais comuns usadas quando nenhuma é especificada
# 6=Pregão Eletrônico, 8=Dispensa, 4=Concorrência Eletrônica, 9=Inexigibilidade
DEFAULT_MODALIDADES = [6, 8, 4, 9]

# Tamanho de página mínimo aceito pela API do PNCP
PNCP_MIN_PAGE_SIZE = 10


class PNCPClient:
    def __init__(self):
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=settings.pncp_base_url,
                timeout=settings.pncp_timeout_seconds,
                headers={"Accept": "application/json"},
            )
        return self._client

    async def close(self) -> None:
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    async def _fetch_one(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Single API call. Returns raw response dict or empty result on error."""
        try:
            client = await self._get_client()
            response = await client.get(PNCP_SEARCH_ENDPOINT, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.warning("PNCP API HTTP error %s: %s", e.response.status_code, e.response.text[:200])
            return {"data": [], "totalRegistros": 0}
        except httpx.RequestError as e:
            logger.warning("PNCP API request error: %s", e)
            return {"data": [], "totalRegistros": 0}
        except Exception as e:
            logger.error("Unexpected PNCP API error: %s", e)
            return {"data": [], "totalRegistros": 0}

    async def search(
        self,
        q: Optional[str] = None,
        uf: Optional[str] = None,
        modalidade: Optional[str] = None,
        status: Optional[str] = None,
        valor_min: Optional[float] = None,
        valor_max: Optional[float] = None,
        data_inicial: Optional[str] = None,
        data_final: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        """Search PNCP API for editais. Returns raw response dict or empty result on error."""
        from datetime import date, timedelta

        # PNCP requires dataInicial and dataFinal
        if not data_inicial:
            data_inicial = (date.today() - timedelta(days=90)).strftime("%Y%m%d")
        if not data_final:
            data_final = date.today().strftime("%Y%m%d")

        # Normalize date format: YYYY-MM-DD → YYYYMMDD
        data_inicial = data_inicial.replace("-", "")
        data_final = data_final.replace("-", "")

        page_size_clamped = max(PNCP_MIN_PAGE_SIZE, min(page_size, 50))

        base_params: Dict[str, Any] = {
            "dataInicial": data_inicial,
            "dataFinal": data_final,
            "pagina": page,
            "tamanhoPagina": page_size_clamped,
        }

        if q:
            base_params["palavraChave"] = q
        if uf:
            base_params["uf"] = uf.upper()
        if valor_min is not None:
            base_params["valorTotalEstimadoMinimo"] = valor_min
        if valor_max is not None:
            base_params["valorTotalEstimadoMaximo"] = valor_max

        if modalidade:
            # Modalidade específica: chamada única
            return await self._fetch_one({**base_params, "codigoModalidadeContratacao": int(modalidade)})

        # Sem modalidade: busca em paralelo nas modalidades mais comuns
        responses = await asyncio.gather(
            *[self._fetch_one({**base_params, "codigoModalidadeContratacao": m}) for m in DEFAULT_MODALIDADES],
            return_exceptions=True,
        )

        merged_data: List[Dict[str, Any]] = []
        total = 0
        for r in responses:
            if isinstance(r, dict):
                merged_data.extend(r.get("data") or [])
                total += int(r.get("totalRegistros") or 0)

        return {"data": merged_data, "totalRegistros": total}

    async def get_edital(self, cnpj: str, ano: int, sequencial: int) -> Optional[Dict[str, Any]]:
        """Fetch a single edital detail from PNCP API."""
        path = f"/orgaos/{cnpj}/compras/{ano}/{sequencial}"
        try:
            client = await self._get_client()
            response = await client.get(path)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return None
            logger.warning("PNCP get_edital error %s", e.response.status_code)
            return None
        except Exception as e:
            logger.error("PNCP get_edital unexpected error: %s", e)
            return None


# Singleton instance
pncp_client = PNCPClient()
