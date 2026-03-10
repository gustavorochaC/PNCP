import React from 'react'
import type { EditalStatus } from '../../types/edital'

const STATUS_STYLES: Record<EditalStatus, { wrapper: string; dot: string }> = {
  publicado: {
    wrapper: 'bg-blue-50 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
  },
  aberto: {
    wrapper: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
  },
  encerrado: {
    wrapper: 'bg-slate-100 text-slate-600 border border-slate-200',
    dot: 'bg-slate-400',
  },
  revogado: {
    wrapper: 'bg-red-50 text-red-700 border border-red-200',
    dot: 'bg-red-500',
  },
  anulado: {
    wrapper: 'bg-red-50 text-red-600 border border-red-200',
    dot: 'bg-red-400',
  },
  suspenso: {
    wrapper: 'bg-amber-50 text-amber-700 border border-amber-200',
    dot: 'bg-amber-500',
  },
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
  const styles = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${styles.wrapper}`}>
      <span className={`inline-block size-1.5 rounded-full shrink-0 ${styles.dot}`} />
      {STATUS_LABELS[status]}
    </span>
  )
}
