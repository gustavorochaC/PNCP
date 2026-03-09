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
      className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      <option value="">Todas as modalidades</option>
      {MODALIDADES.map(m => (
        <option key={m.codigo} value={m.codigo}>{m.nome}</option>
      ))}
    </select>
  )
}
