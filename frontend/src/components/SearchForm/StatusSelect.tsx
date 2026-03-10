import React from 'react'
import { STATUS_LIST } from '../../utils/modalidades'

interface StatusSelectProps {
  value: string
  onChange: (value: string) => void
}

export function StatusSelect({ value, onChange }: StatusSelectProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="block w-full rounded-lg border border-input bg-background py-2.5 px-3 text-sm text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring"
    >
      <option value="">Todos os status</option>
      {STATUS_LIST.map(s => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  )
}
