import React from 'react'
import type { EditalSummary } from '../../types/edital'
import { StatusBadge } from '../ui/Badge'
import { formatBRL, formatDate, formatDateTime, truncate } from '../../utils/formatters'

interface EditalCardProps {
  edital: EditalSummary
}

export function EditalCard({ edital }: EditalCardProps) {
  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-mono truncate">{edital.pncp_id}</p>
          <h3 className="mt-0.5 text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
            {edital.objeto_compra || 'Objeto não informado'}
          </h3>
        </div>
        <StatusBadge status={edital.status} />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-3">
        {edital.nome_orgao && (
          <span className="flex items-center gap-1">
            <span className="text-gray-400">Órgão:</span>
            <span className="font-medium truncate max-w-[200px]">{edital.nome_orgao}</span>
          </span>
        )}
        {(edital.municipio_nome || edital.uf) && (
          <span className="flex items-center gap-1">
            <span className="text-gray-400">Local:</span>
            <span>{[edital.municipio_nome, edital.uf].filter(Boolean).join(' / ')}</span>
          </span>
        )}
        {edital.modalidade_nome && (
          <span className="flex items-center gap-1">
            <span className="text-gray-400">Modalidade:</span>
            <span>{edital.modalidade_nome}</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          {edital.valor_total_estimado != null && (
            <span>
              <span className="text-gray-400">Valor est.: </span>
              <span className="font-semibold text-gray-700">{formatBRL(edital.valor_total_estimado)}</span>
            </span>
          )}
          {edital.data_publicacao_pncp && (
            <span>
              <span className="text-gray-400">Publicação: </span>
              {formatDate(edital.data_publicacao_pncp)}
            </span>
          )}
          {edital.data_encerramento_proposta && (
            <span>
              <span className="text-gray-400">Encerramento: </span>
              {formatDateTime(edital.data_encerramento_proposta)}
            </span>
          )}
        </div>

        {edital.link_edital && (
          <a
            href={edital.link_edital}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline whitespace-nowrap"
          >
            Ver edital →
          </a>
        )}
      </div>
    </article>
  )
}
