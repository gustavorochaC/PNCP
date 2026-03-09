from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional
from decimal import Decimal
from asyncpg import Pool

from app.dependencies import get_db_pool
from app.services.search_service import search_service
from app.services.supabase_service import supabase_service
from app.models.edital import SearchResponse

router = APIRouter(prefix="/editais", tags=["editais"])

MODALIDADES = [
    {"codigo": "1", "nome": "Leilão - Eletrônico"},
    {"codigo": "2", "nome": "Diálogo Competitivo"},
    {"codigo": "3", "nome": "Concurso"},
    {"codigo": "4", "nome": "Concorrência - Eletrônica"},
    {"codigo": "5", "nome": "Concorrência - Presencial"},
    {"codigo": "6", "nome": "Pregão - Eletrônico"},
    {"codigo": "7", "nome": "Pregão - Presencial"},
    {"codigo": "8", "nome": "Dispensa de Licitação"},
    {"codigo": "9", "nome": "Inexigibilidade"},
    {"codigo": "10", "nome": "Manifestação de Interesse"},
    {"codigo": "11", "nome": "Pré-qualificação"},
    {"codigo": "12", "nome": "Credenciamento"},
    {"codigo": "13", "nome": "Leilão - Presencial"},
]


@router.get("/search", response_model=SearchResponse)
async def search_editais(
    q: Optional[str] = Query(None, description="Palavra-chave"),
    uf: Optional[str] = Query(None, min_length=2, max_length=2, description="UF (ex: SP)"),
    modalidade: Optional[str] = Query(None, description="Código da modalidade"),
    status: Optional[str] = Query(None, description="Status do edital"),
    valor_min: Optional[Decimal] = Query(None, description="Valor mínimo estimado"),
    valor_max: Optional[Decimal] = Query(None, description="Valor máximo estimado"),
    data_inicial: Optional[str] = Query(None, description="Data inicial (YYYY-MM-DD ou YYYYMMDD)"),
    data_final: Optional[str] = Query(None, description="Data final (YYYY-MM-DD ou YYYYMMDD)"),
    page: int = Query(1, ge=1, description="Página"),
    page_size: int = Query(20, ge=1, le=100, description="Itens por página"),
    pool: Pool = Depends(get_db_pool),
):
    return await search_service.search(
        pool=pool,
        q=q,
        uf=uf,
        modalidade=modalidade,
        status=status,
        valor_min=valor_min,
        valor_max=valor_max,
        data_inicial=data_inicial,
        data_final=data_final,
        page=page,
        page_size=page_size,
    )


@router.get("/modalidades")
async def list_modalidades():
    return {"data": MODALIDADES}


@router.get("/{pncp_id:path}")
async def get_edital(
    pncp_id: str,
    pool: Pool = Depends(get_db_pool),
):
    edital = await supabase_service.get_by_pncp_id(pool, pncp_id)
    if not edital:
        raise HTTPException(status_code=404, detail="Edital não encontrado")
    return edital
