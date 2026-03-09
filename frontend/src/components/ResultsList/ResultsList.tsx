import React from 'react'
import type { SearchResponse } from '../../types/edital'
import { EditalCard } from './EditalCard'
import { Spinner } from '../ui/Spinner'

interface ResultsListProps {
  data: SearchResponse | undefined
  isLoading: boolean
  isFetching: boolean
  error: Error | null
}

export function ResultsList({ data, isLoading, isFetching, error }: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-semibold text-red-700">Erro ao buscar editais</p>
        <p className="mt-1 text-xs text-red-600">{error.message}</p>
      </div>
    )
  }

  if (!data) return null

  const { data: items, pagination, meta } = data

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center">
        <p className="text-sm font-semibold text-gray-600">Nenhum edital encontrado</p>
        <p className="mt-1 text-xs text-gray-400">Tente ajustar os filtros ou ampliar o período.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{pagination.total_items.toLocaleString('pt-BR')}</span> editais encontrados
          {isFetching && !isLoading && <span className="ml-2 text-blue-500 text-xs">Atualizando…</span>}
        </p>
        <p className="text-xs text-gray-400">
          {meta.search_time_ms}ms · {meta.sources.join(', ')}
          {meta.pncp_new_count > 0 && ` · +${meta.pncp_new_count} novos`}
        </p>
      </div>

      <div className="space-y-3">
        {items.map(edital => (
          <EditalCard key={edital.pncp_id} edital={edital} />
        ))}
      </div>
    </div>
  )
}
