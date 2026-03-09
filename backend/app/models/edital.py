from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from enum import Enum


class EditalStatus(str, Enum):
    publicado = "publicado"
    aberto = "aberto"
    encerrado = "encerrado"
    revogado = "revogado"
    anulado = "anulado"
    suspenso = "suspenso"


class EditalSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[UUID] = None
    pncp_id: str
    numero_compra: Optional[str] = None
    nome_orgao: Optional[str] = None
    uf: Optional[str] = None
    municipio_nome: Optional[str] = None
    modalidade_nome: Optional[str] = None
    objeto_compra: Optional[str] = None
    status: Optional[EditalStatus] = None
    valor_total_estimado: Optional[Decimal] = None
    data_publicacao_pncp: Optional[datetime] = None
    data_abertura_proposta: Optional[datetime] = None
    data_encerramento_proposta: Optional[datetime] = None
    link_edital: Optional[str] = None
    rank: Optional[float] = None


class Pagination(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int


class SearchMeta(BaseModel):
    sources: List[str]
    cache_hit_count: int
    pncp_new_count: int
    search_time_ms: int


class SearchResponse(BaseModel):
    data: List[EditalSummary]
    pagination: Pagination
    meta: SearchMeta


class SearchParams(BaseModel):
    q: Optional[str] = None
    uf: Optional[str] = None
    modalidade: Optional[str] = None
    status: Optional[str] = None
    valor_min: Optional[Decimal] = None
    valor_max: Optional[Decimal] = None
    data_inicial: Optional[str] = None
    data_final: Optional[str] = None
    page: int = 1
    page_size: int = 20
