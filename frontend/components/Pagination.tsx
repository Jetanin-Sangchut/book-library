import { usePagination } from '@/hooks/usePagination'
import type { Meta } from '@/types'

type Props = {
  meta: Meta
  onChange: (page: number) => void
}

// Returns page numbers to display with null as ellipsis gap
function getWindowedPages(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | null)[] = [1]
  const leftEdge = Math.max(2, current - 2)
  const rightEdge = Math.min(total - 1, current + 2)

  if (leftEdge > 2) pages.push(null)
  for (let p = leftEdge; p <= rightEdge; p++) pages.push(p)
  if (rightEdge < total - 1) pages.push(null)
  pages.push(total)

  return pages
}

export default function Pagination({ meta, onChange }: Props) {
  const { totalPages, canPrev, canNext, goTo, goNext, goPrev } = usePagination(meta, onChange)
  if (totalPages <= 1) return null

  const pages = getWindowedPages(meta.page, totalPages)

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={goPrev}
        disabled={!canPrev}
        className="btn btn-ghost text-xs disabled:opacity-40"
        style={{ padding: '4px 10px' }}
        aria-label="หน้าก่อนหน้า"
      >
        ‹
      </button>

      {pages.map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} className="text-xs" style={{ color: 'var(--tertiary)', padding: '4px 4px' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={`btn text-xs ${p === meta.page ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '4px 10px', minWidth: '32px' }}
            aria-current={p === meta.page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={goNext}
        disabled={!canNext}
        className="btn btn-ghost text-xs disabled:opacity-40"
        style={{ padding: '4px 10px' }}
        aria-label="หน้าถัดไป"
      >
        ›
      </button>
    </div>
  )
}
