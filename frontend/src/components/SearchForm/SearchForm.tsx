import React from 'react'
import { KeywordInput } from './KeywordInput'
import { UfSelect } from './UfSelect'
import { ModalidadeSelect } from './ModalidadeSelect'
import { StatusSelect } from './StatusSelect'
import { ValorRange } from './ValorRange'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import type { SearchFilters } from '../../types/edital'

interface SearchFormProps {
  filters: SearchFilters
  onUpdate: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void
  onCommit: (updates?: Partial<SearchFilters>) => void
  onReset: () => void
  isLoading: boolean
  isFetching: boolean
}

export function SearchForm({ filters, onUpdate, onCommit, onReset, isLoading, isFetching }: SearchFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCommit()
  }

  const handleSelectChange = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    onUpdate(key, value)
    onCommit({ [key]: value } as Partial<SearchFilters>)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
      <KeywordInput
        value={filters.q}
        onChange={v => onUpdate('q', v)}
        onCommit={onCommit}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <UfSelect
          value={filters.uf}
          onChange={v => handleSelectChange('uf', v)}
        />
        <ModalidadeSelect
          value={filters.modalidade}
          onChange={v => handleSelectChange('modalidade', v)}
        />
        <StatusSelect
          value={filters.status}
          onChange={v => handleSelectChange('status', v)}
        />
        <ValorRange
          valorMin={filters.valor_min}
          valorMax={filters.valor_max}
          onChangeMin={v => onUpdate('valor_min', v)}
          onChangeMax={v => onUpdate('valor_max', v)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onReset}>
          Limpar
        </Button>
        <Button type="submit" size="sm">
          {isFetching
            ? <><Spinner size="sm" /><span className="ml-1.5">Buscando…</span></>
            : 'Buscar'}
        </Button>
      </div>
    </form>
  )
}
