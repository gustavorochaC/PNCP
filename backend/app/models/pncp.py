from pydantic import BaseModel
from typing import Optional, List, Any


class OrgaoEntidade(BaseModel):
    cnpj: Optional[str] = None
    razaoSocial: Optional[str] = None
    nomeFantasia: Optional[str] = None


class UnidadeOrgao(BaseModel):
    cnpjUnidade: Optional[str] = None
    nomeUnidade: Optional[str] = None
    municipioNome: Optional[str] = None
    ufSigla: Optional[str] = None
    ufNome: Optional[str] = None
    codigoIbge: Optional[str] = None


class ModalidadeContratacao(BaseModel):
    codigo: Optional[str] = None
    descricao: Optional[str] = None


class SituacaoCompra(BaseModel):
    codigo: Optional[int] = None
    descricao: Optional[str] = None


class PNCPEdital(BaseModel):
    numeroControlePNCP: Optional[str] = None
    numeroCompra: Optional[str] = None
    anoCompra: Optional[int] = None
    sequencialCompra: Optional[int] = None
    orgaoEntidade: Optional[OrgaoEntidade] = None
    unidadeOrgao: Optional[UnidadeOrgao] = None
    modalidadeContratacao: Optional[ModalidadeContratacao] = None
    situacaoCompra: Optional[SituacaoCompra] = None
    valorTotalEstimado: Optional[float] = None
    valorTotalHomologado: Optional[float] = None
    dataPublicacaoPncp: Optional[str] = None
    dataAberturaProposta: Optional[str] = None
    dataEncerramentoProposta: Optional[str] = None
    dataAtualizacao: Optional[str] = None
    objetoCompra: Optional[str] = None
    informacaoComplementar: Optional[str] = None
    linkSistemaOrigem: Optional[str] = None
    linkEdital: Optional[str] = None


class PNCPSearchResponse(BaseModel):
    data: Optional[List[Any]] = None
    totalRegistros: Optional[int] = None
    totalPaginas: Optional[int] = None
    paginaAtual: Optional[int] = None
    itensPorPagina: Optional[int] = None
