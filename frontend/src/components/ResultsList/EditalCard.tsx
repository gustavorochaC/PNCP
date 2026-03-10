import React from 'react'
import type { EditalSummary } from '../../types/edital'
import { StatusBadge } from '../ui/Badge'
import { formatBRL, formatDate, formatDateTime } from '../../utils/formatters'
import { MapPin, Building, Calendar, Clock, ArrowUpRight } from 'lucide-react'

interface EditalCardProps {
  edital: EditalSummary
}

const STATUS_BORDER: Record<string, string> = {
  aberto: 'border-l-emerald-500',
  publicado: 'border-l-blue-500',
  encerrado: 'border-l-slate-300',
  revogado: 'border-l-red-500',
  anulado: 'border-l-red-400',
  suspenso: 'border-l-amber-400',
}

export function EditalCard({ edital }: EditalCardProps) {
  const borderColor = edital.status
    ? (STATUS_BORDER[edital.status] ?? 'border-l-border')
    : 'border-l-border'

  return (
    <article
      className={`group relative rounded-xl border border-border border-l-[3px] ${borderColor} bg-card px-5 py-4 shadow-sm transition-all duration-150 hover:shadow-md hover:-translate-y-px`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <code className="inline-block text-[10px] text-muted-foreground/60 font-mono bg-muted/50 px-1.5 py-0.5 rounded mb-1.5 truncate max-w-full">
            {edital.pncp_id}
          </code>
          <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
            {edital.objeto_compra || 'Objeto não informado'}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={edital.status} />
          {edital.valor_total_estimado != null && (
            <span className="text-sm font-bold text-foreground tabular-nums">
              {formatBRL(edital.valor_total_estimado)}
            </span>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {edital.nome_orgao && (
          <span className="flex items-center gap-1.5">
            <Building className="size-3 shrink-0 text-muted-foreground/40" />
            <span className="truncate max-w-[220px]">{edital.nome_orgao}</span>
          </span>
        )}
        {(edital.municipio_nome || edital.uf) && (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3 shrink-0 text-muted-foreground/40" />
            <span>{[edital.municipio_nome, edital.uf].filter(Boolean).join(' / ')}</span>
          </span>
        )}
        {edital.modalidade_nome && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-1.5 rounded-full bg-primary/40 shrink-0" />
            <span>{edital.modalidade_nome}</span>
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {edital.data_publicacao_pncp && (
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3 shrink-0 text-muted-foreground/40" />
              <span>{formatDate(edital.data_publicacao_pncp)}</span>
            </span>
          )}
          {edital.data_encerramento_proposta && (
            <span className="flex items-center gap-1.5">
              <Clock className="size-3 shrink-0 text-muted-foreground/40" />
              <span className={edital.status === 'aberto' ? 'text-emerald-600 font-medium' : ''}>
                {formatDateTime(edital.data_encerramento_proposta)}
              </span>
            </span>
          )}
        </div>

        {edital.link_edital && (
          <a
            href={edital.link_edital}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-75 transition-opacity whitespace-nowrap"
          >
            Ver edital
            <ArrowUpRight className="size-3" />
          </a>
        )}
      </div>
    </article>
  )
}
