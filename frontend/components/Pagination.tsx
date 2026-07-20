'use client'

import { usePagination } from '@/hooks/usePagination'
import type { Meta } from '@/types'

type Props = {
  meta: Meta
  onChange: (page: number) => void
}

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
    <>
      <style>{`
        .pg-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          margin-top: 40px;
        }
        .pg-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px;
          min-width: 36px;
          padding: 0 6px;
          border: none;
          background: transparent;
          border-radius: 5px;
          font-size: .78rem;
          font-weight: 500;
          color: var(--muted);
          cursor: pointer;
          line-height: 1;
          transition: background .15s, color .15s;
          font-family: var(--font-body);
        }
        .pg-btn:hover:not(:disabled) { background: rgba(31,27,20,.06); }
        .pg-btn:disabled { opacity: .3; cursor: not-allowed; }
        .pg-btn.is-current {
          color: var(--primary);
          font-weight: 700;
          background: rgba(62,90,58,.08);
          cursor: default;
        }
        .pg-gap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 32px;
          width: 24px;
          font-size: .78rem;
          color: var(--tertiary);
          user-select: none;
        }
      `}</style>

      <nav className="pg-nav" aria-label="Pagination">
        <button
          className="pg-btn"
          onClick={goPrev}
          disabled={!canPrev}
          aria-label="หน้าก่อนหน้า"
        >
          <span className="material-icons icon-md" aria-hidden="true">chevron_left</span>
        </button>

        {pages.map((p, i) =>
          p === null ? (
            <span key={`gap-${i}`} className="pg-gap">…</span>
          ) : (
            <button
              key={p}
              className={`pg-btn${p === meta.page ? ' is-current' : ''}`}
              onClick={() => goTo(p)}
              aria-current={p === meta.page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          className="pg-btn"
          onClick={goNext}
          disabled={!canNext}
          aria-label="หน้าถัดไป"
        >
          <span className="material-icons icon-md" aria-hidden="true">chevron_right</span>
        </button>
      </nav>
    </>
  )
}
