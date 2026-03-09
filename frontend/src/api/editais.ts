import axios from 'axios'
import type { SearchResponse, SearchFilters } from '../types/edital'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
})

export async function searchEditais(filters: Partial<SearchFilters>): Promise<SearchResponse> {
  const params: Record<string, string | number> = {}

  if (filters.q?.trim()) params.q = filters.q.trim()
  if (filters.uf) params.uf = filters.uf
  if (filters.modalidade) params.modalidade = filters.modalidade
  if (filters.status) params.status = filters.status
  if (filters.valor_min) params.valor_min = filters.valor_min
  if (filters.valor_max) params.valor_max = filters.valor_max
  if (filters.data_inicial) params.data_inicial = filters.data_inicial
  if (filters.data_final) params.data_final = filters.data_final
  if (filters.page) params.page = filters.page
  if (filters.page_size) params.page_size = filters.page_size

  const response = await api.get<SearchResponse>('/editais/search', { params })
  return response.data
}

export async function getEdital(pncpId: string) {
  const response = await api.get(`/editais/${encodeURIComponent(pncpId)}`)
  return response.data
}

export async function getModalidades() {
  const response = await api.get('/editais/modalidades')
  return response.data
}
