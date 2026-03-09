import { useState, useCallback } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { searchEditais } from '../api/editais'
import type { SearchFilters, SearchResponse } from '../types/edital'

const DEFAULT_FILTERS: SearchFilters = {
  q: '',
  uf: '',
  modalidade: '',
  status: '',
  valor_min: '',
  valor_max: '',
  data_inicial: '',
  data_final: '',
  page: 1,
  page_size: 20,
}

export function useEditaisSearch() {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [committed, setCommitted] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [hasSearched, setHasSearched] = useState(false)

  const query = useQuery<SearchResponse, Error>({
    queryKey: ['editais', committed],
    queryFn: () => searchEditais(committed),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled: hasSearched,
  })

  const commit = useCallback((updates?: Partial<SearchFilters>) => {
    setHasSearched(true)
    setCommitted(prev => ({
      ...prev,
      ...(updates ?? filters),
      page: updates?.page ?? 1,
    }))
  }, [filters])

  const updateFilter = useCallback(<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
    setCommitted(prev => ({ ...prev, page }))
  }, [])

  const reset = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setCommitted(DEFAULT_FILTERS)
  }, [])

  return {
    filters,
    committed,
    updateFilter,
    commit,
    setPage,
    reset,
    ...query,
  }
}
