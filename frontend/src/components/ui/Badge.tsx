import React from 'react'
import type { EditalStatus } from '../../types/edital'

const STATUS_COLORS: Record<EditalStatus, string> = {
  publicado: 'bg-blue-100 text-blue-700',
  aberto: 'bg-green-100 text-green-700',
  encerrado: 'bg-gray-100 text-gray-600',
  revogado: 'bg-red-100 text-red-700',
  anulado: 'bg-red-100 text-red-700',
  suspenso: 'bg-yellow-100 text-yellow-700',
}

const STATUS_LABELS: Record<EditalStatus, string> = {
  publicado: 'Publicado',
  aberto: 'Aberto',
  encerrado: 'Encerrado',
  revogado: 'Revogado',
  anulado: 'Anulado',
  suspenso: 'Suspenso',
}

interface BadgeProps {
  status: EditalStatus | null
}

export function StatusBadge({ status }: BadgeProps) {
  if (!status) return null
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
