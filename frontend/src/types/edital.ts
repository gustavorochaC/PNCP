export type EditalStatus = 'publicado' | 'aberto' | 'encerrado' | 'revogado' | 'anulado' | 'suspenso'

export interface EditalSummary {
  id: string | null
  pncp_id: string
  numero_compra: string | null
  nome_orgao: string | null
  uf: string | null
  municipio_nome: string | null
  modalidade_nome: string | null
  objeto_compra: string | null
  status: EditalStatus | null
  valor_total_estimado: number | null
  data_publicacao_pncp: string | null
  data_abertura_proposta: string | null
  data_encerramento_proposta: string | null
  link_edital: string | null
  rank: number | null
}

export interface Pagination {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}

export interface SearchMeta {
  sources: string[]
  cache_hit_count: number
  pncp_new_count: number
  search_time_ms: number
}

export interface SearchResponse {
  data: EditalSummary[]
  pagination: Pagination
  meta: SearchMeta
}

export interface SearchFilters {
  q: string
  uf: string
  modalidade: string
  status: string
  valor_min: string
  valor_max: string
  data_inicial: string
  data_final: string
  page: number
  page_size: number
}

export interface Modalidade {
  codigo: string
  nome: string
}
