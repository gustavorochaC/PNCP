import React from 'react'
import { MODALIDADES, STATUS_LIST } from '../../utils/modalidades'

interface SearchSummaryProps {
  totalItems: number
  isFetching: boolean
  filters: {
    q?: string
    uf?: string
    modalidade?: string
    status?: string
    valor_min?: string
    valor_max?: string
  }
  onReset: () => void
}

export function SearchSummary({ totalItems, isFetching, filters, onReset }: SearchSummaryProps) {
  const activeBadges: { label: string; key: string }[] = []

  if (filters.q?.trim()) {
    activeBadges.push({ label: `"${filters.q.trim()}"`, key: 'q' })
  }
  if (filters.uf) {
    activeBadges.push({ label: `UF: ${filters.uf}`, key: 'uf' })
  }
  if (filters.modalidade) {
    const m = MODALIDADES.find(x => x.codigo === filters.modalidade)
    activeBadges.push({ label: m ? m.nome : `Modalidade: ${filters.modalidade}`, key: 'modalidade' })
  }
  if (filters.status) {
    const s = STATUS_LIST.find(x => x.value === filters.status)
    activeBadges.push({ label: s ? s.label : filters.status, key: 'status' })
  }
  if (filters.valor_min) {
    activeBadges.push({ label: `Mín: R$ ${Number(filters.valor_min).toLocaleString('pt-BR')}`, key: 'valor_min' })
  }
  if (filters.valor_max) {
    activeBadges.push({ label: `Máx: R$ ${Number(filters.valor_max).toLocaleString('pt-BR')}`, key: 'valor_max' })
  }

  const hasFilters = activeBadges.length > 0

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted-foreground">
        <span className="font-semibold text-foreground">{totalItems.toLocaleString('pt-BR')}</span>{' '}
        {totalItems === 1 ? 'edital encontrado' : 'editais encontrados'}
      </span>

      {activeBadges.map(badge => (
        <span
          key={badge.key}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-foreground"
        >
          {badge.label}
        </span>
      ))}

      {hasFilters && (
        <button
          onClick={onReset}
          className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          Limpar tudo
        </button>
      )}

      {isFetching && (
        <span className="text-xs text-primary animate-pulse ml-auto">Atualizando…</span>
      )}
    </div>
  )
}
