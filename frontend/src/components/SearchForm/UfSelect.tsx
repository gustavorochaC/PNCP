import React from 'react'
import { UF_LIST } from '../../utils/modalidades'

interface UfSelectProps {
  value: string
  onChange: (value: string) => void
}

export function UfSelect({ value, onChange }: UfSelectProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="block w-full rounded-lg border border-input bg-background py-2.5 px-3 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
    >
      <option value="">Todos os estados</option>
      {UF_LIST.map(uf => (
        <option key={uf} value={uf}>{uf}</option>
      ))}
    </select>
  )
}
