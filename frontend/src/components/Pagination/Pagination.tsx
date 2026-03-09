import React from 'react'
import type { Pagination as PaginationType } from '../../types/edital'
import { Button } from '../ui/Button'

interface PaginationProps {
  pagination: PaginationType
  onPageChange: (page: number) => void
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, total_pages } = pagination
  if (total_pages <= 1) return null

  const pages = buildPageNumbers(page, total_pages)

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Página anterior"
      >
        ‹
      </Button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm select-none">…</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onPageChange(p as number)}
            className="min-w-[36px]"
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="secondary"
        size="sm"
        disabled={page >= total_pages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Próxima página"
      >
        ›
      </Button>
    </div>
  )
}

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}
