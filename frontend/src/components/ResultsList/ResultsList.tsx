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

export function ResultsList({ data, isLoading, error }: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-semibold text-destructive">Erro ao buscar editais</p>
        <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  if (!data) return null

  const { data: items } = data

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-10 text-center">
        <p className="text-sm font-semibold text-muted-foreground">Nenhum edital encontrado</p>
        <p className="mt-1 text-xs text-muted-foreground">Tente ajustar os filtros ou ampliar o período.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map(edital => (
        <EditalCard key={edital.pncp_id} edital={edital} />
      ))}
    </div>
  )
}
