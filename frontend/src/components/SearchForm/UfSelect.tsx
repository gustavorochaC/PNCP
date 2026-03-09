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
      className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      <option value="">Todos os estados</option>
      {UF_LIST.map(uf => (
        <option key={uf} value={uf}>{uf}</option>
      ))}
    </select>
  )
}
