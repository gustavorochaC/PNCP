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
      className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      <option value="">Todos os status</option>
      {STATUS_LIST.map(s => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  )
}
