import React from 'react'
import { MODALIDADES } from '../../utils/modalidades'

interface ModalidadeSelectProps {
  value: string
  onChange: (value: string) => void
}

export function ModalidadeSelect({ value, onChange }: ModalidadeSelectProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="block w-full rounded-lg border border-input bg-background py-2.5 px-3 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
    >
      <option value="">Todas as modalidades</option>
      {MODALIDADES.map(m => (
        <option key={m.codigo} value={m.codigo}>{m.nome}</option>
      ))}
    </select>
  )
}
