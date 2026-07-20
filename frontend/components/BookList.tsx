'use client'

import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Book, BookStatus } from '@/types'

type Props = {
  books: Book[]
  hasActiveFilters?: boolean
  onDelete: (id: number) => Promise<void>
  onStatusChange: (id: number, status: string) => Promise<void>
  onToggleFavorite: (id: number) => Promise<void>
}

const STATUS_CONFIG: Record<BookStatus, { label: string; triggerCls: string }> = {
  shelved: { label: 'อยู่บนชั้น', triggerCls: 'status-trigger-shelved' },
  reading: { label: 'กำลังอ่าน', triggerCls: 'status-trigger-reading' },
  read:    { label: 'อ่านแล้ว',   triggerCls: 'status-trigger-read' },
}

const ALL_STATUSES: BookStatus[] = ['shelved', 'reading', 'read']

// Deterministic gradient per title first letter
function coverGradient(title: string): string {
  const palettes: [string, string][] = [
    ['#2E4A2A', '#5A8A52'],
    ['#6B4A2A', '#A07848'],
    ['#2A3A6B', '#4A6A9A'],
    ['#4A2A6B', '#7A52A0'],
    ['#2A5A4A', '#4A9070'],
    ['#5A3A2A', '#9A6A4A'],
    ['#2A5A5A', '#4A9090'],
    ['#5A2A4A', '#9A4A7A'],
    ['#3A4A2A', '#6A8A4A'],
    ['#2A3A4A', '#4A6A7A'],
  ]
  const idx = (title.charCodeAt(0) || 0) % palettes.length
  const [from, to] = palettes[idx]
  return `linear-gradient(155deg,${from} 0%,${to} 100%)`
}

export default function BookList({ books, hasActiveFilters = false, onDelete, onStatusChange, onToggleFavorite }: Props) {
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.status-dropdown')) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleDelete = async (book: Book) => {
    const result = await Swal.fire({
      title: `ต้องการลบ "${book.title}" หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#c0392b',
      customClass: { popup: 'rounded-lg' },
    })
    if (result.isConfirmed) {
      await onDelete(book.id)
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `ลบ "${book.title}" แล้ว`,
        timer: 1800,
        showConfirmButton: false,
        customClass: { popup: 'rounded-lg' },
      })
    }
  }

  if (books.length === 0) {
    return (
      <div className="card text-center py-16">
        {hasActiveFilters ? (
          <>
            <p className="text-sm font-medium">ไม่พบหนังสือที่ตรงกับการค้นหา</p>
            <p className="text-xs mt-1 text-muted">ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง</p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium">ยังไม่มีหนังสือในคลัง</p>
            <p className="text-xs mt-1 text-muted">กรอกข้อมูลด้านบนเพื่อเพิ่มเล่มแรก</p>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <style>{`
        .book-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 16px 32px;
        }
        .book-card {
          flex: 0 0 220px;
          width: 220px;
          display: flex;
          flex-direction: column;
          cursor: default;
        }
        .cover-wrap {
          position: relative;
          width: 220px;
          height: 330px;
          overflow: hidden;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,.12);
          transition: box-shadow .25s ease, transform .25s ease;
          flex-shrink: 0;
        }
        .book-card:hover .cover-wrap {
          box-shadow: 0 8px 24px rgba(0,0,0,.18);
          transform: translateY(-3px);
        }
        .cover-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 700;
          color: rgba(255,255,255,.7);
          letter-spacing: -2px;
          user-select: none;
          transition: transform .3s ease;
        }
        .book-card:hover .cover-placeholder { transform: scale(1.05); }
        .card-body {
          padding: 9px 6px 6px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .card-title {
          font-size: .82rem;
          font-weight: 600;
          color: var(--ink);
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color .15s;
          min-height: 2.3em;
        }
        .book-card:hover .card-title { color: var(--primary); }
        .card-author {
          font-size: .7rem;
          color: var(--muted);
          margin-top: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-genre {
          font-size: .65rem;
          color: var(--muted);
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 7px;
          gap: 4px;
          position: relative;
        }
        .card-actions-left {
          display: flex;
          align-items: center;
          gap: 4px;
          min-width: 0;
          flex: 1;
        }

        /* ── Status dropdown ─────────────────────── */
        .status-dropdown { position: relative; }

        .status-trigger {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: .75rem;
          font-weight: 500;
          padding: 3px 7px;
          border-radius: 4px;
          cursor: pointer;
          white-space: nowrap;
          line-height: 1.4;
          transition: opacity .1s, background .15s;
          border: 1px solid transparent;
        }
        .status-trigger:hover { opacity: .85; }
        .status-trigger:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

        /* shelved — warm amber/ochre: book waiting on the shelf */
        .status-trigger-shelved {
          background: rgba(160,110,25,.08);
          border-color: rgba(160,110,25,.28);
          color: #7A5A1A;
        }
        /* reading — moss green: active, in progress */
        .status-trigger-reading {
          background: rgba(62,90,58,.12);
          border-color: rgba(62,90,58,.35);
          color: var(--primary);
        }
        /* read — cool slate: complete, settled */
        .status-trigger-read {
          background: rgba(58,90,114,.08);
          border-color: rgba(58,90,114,.28);
          color: #3A5A72;
        }

        .status-caret {
          width: 10px;
          height: 10px;
          flex-shrink: 0;
          opacity: .7;
        }

        .dropdown-menu {
          position: absolute;
          bottom: calc(100% + 4px);
          left: 0;
          z-index: 50;
          background: var(--surface);
          border: 1px solid var(--border-input);
          border-radius: 6px;
          box-shadow: 0 4px 16px rgba(0,0,0,.12);
          min-width: 130px;
          overflow: hidden;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 7px 12px;
          font-size: .75rem;
          font-weight: 400;
          color: var(--ink);
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background .1s;
        }
        .dropdown-item:hover { background: rgba(31,27,20,.05); }
        .dropdown-item.is-active { font-weight: 600; }
        .dropdown-item.is-active-shelved { color: #7A5A1A; }
        .dropdown-item.is-active-reading { color: var(--primary); }
        .dropdown-item.is-active-read    { color: #3A5A72; }
        .dropdown-check {
          width: 12px;
          flex-shrink: 0;
          font-size: .7rem;
          color: inherit;
        }

        /* ── Fav + delete ────────────────────────── */
        .btn-fav {
          background: none;
          border: none;
          line-height: 1;
          cursor: pointer;
          padding: 4px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          border-radius: 4px;
          color: var(--tertiary);
          transition: color .15s, background .15s;
        }
        .btn-fav.is-fav { color: var(--primary); }
        .btn-fav:hover { background: rgba(62,90,58,.08); }
        .btn-fav:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 3px; }
        .btn-delete {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          padding: 4px;
          border-radius: 4px;
          color: var(--tertiary);
          flex-shrink: 0;
          cursor: pointer;
          transition: color .15s, background .15s;
        }
        .btn-delete:hover { color: #c0392b; background: rgba(192,57,43,.08); }
        .btn-delete:focus-visible { outline: 2px solid #c0392b; outline-offset: 1px; }

        @media (prefers-reduced-motion: reduce) {
          .cover-wrap, .cover-placeholder, .card-title, .btn-fav {
            transition: none;
          }
        }
      `}</style>

      <div className="book-grid">
        {books.map(book => {
          const status = book.status ?? 'shelved'
          const { label, triggerCls } = STATUS_CONFIG[status] ?? STATUS_CONFIG.shelved
          const letter = book.title.charAt(0).toUpperCase()
          const gradient = coverGradient(book.title)
          const isFav = Boolean(book.is_favorite)
          const isOpen = openDropdownId === book.id

          return (
            <div key={book.id} className="book-card">
              <div className="cover-wrap">
                <div className="cover-placeholder" style={{ background: gradient }}>
                  {letter}
                </div>
              </div>

              <div className="card-body">
                <div className="card-title">{book.title}</div>
                <p className="card-author">{book.author}</p>
                {book.genre && <p className="card-genre">{book.genre}</p>}
                <div className="card-actions">
                  <div className="card-actions-left">
                    {/* Status dropdown */}
                    <div className="status-dropdown">
                      <button
                        className={`status-trigger ${triggerCls}`}
                        onClick={() => setOpenDropdownId(isOpen ? null : book.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowDown') { e.preventDefault(); setOpenDropdownId(book.id) }
                        }}
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                        title="เปลี่ยนสถานะ"
                      >
                        {label}
                        <svg className="status-caret" viewBox="0 0 10 6" fill="currentColor" aria-hidden="true">
                          <path d="M0 0l5 6 5-6H0z"/>
                        </svg>
                      </button>
                      {isOpen && (
                        <div
                          className="dropdown-menu"
                          role="listbox"
                          aria-label="เลือกสถานะ"
                          onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === 'Escape') { setOpenDropdownId(null); return }
                            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                              e.preventDefault()
                              const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button'))
                              const idx = buttons.indexOf(document.activeElement as HTMLButtonElement)
                              const next = e.key === 'ArrowDown' ? (idx + 1) % buttons.length : (idx - 1 + buttons.length) % buttons.length
                              buttons[next]?.focus()
                            }
                          }}
                        >
                          {ALL_STATUSES.map(s => (
                            <button
                              key={s}
                              className={`dropdown-item${s === status ? ` is-active is-active-${s}` : ''}`}
                              role="option"
                              aria-selected={s === status}
                              ref={el => { if (s === status && el) el.focus() }}
                              onClick={async () => {
                                if (s === status) { setOpenDropdownId(null); return }
                                await onStatusChange(book.id, s)
                                setOpenDropdownId(null)
                                Swal.fire({
                                  toast: true,
                                  position: 'top-end',
                                  icon: 'success',
                                  title: `เปลี่ยนเป็น "${STATUS_CONFIG[s].label}"`,
                                  timer: 1800,
                                  showConfirmButton: false,
                                  customClass: { popup: 'rounded-lg' },
                                })
                              }}
                            >
                              <span className="dropdown-check">{s === status ? '✓' : ''}</span>
                              {STATUS_CONFIG[s].label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Favorite */}
                    <button
                      className={`btn-fav${isFav ? ' is-fav' : ''}`}
                      onClick={async () => {
                        await onToggleFavorite(book.id)
                        Swal.fire({
                          toast: true,
                          position: 'top-end',
                          icon: 'success',
                          title: isFav ? 'ถอดออกจากรายการโปรดแล้ว' : 'เพิ่มในรายการโปรดแล้ว',
                          timer: 1500,
                          showConfirmButton: false,
                          customClass: { popup: 'rounded-lg' },
                        })
                      }}
                      aria-label={isFav ? 'ถอดออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                      title={isFav ? 'ถอดออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
                    >
                      <span className="material-icons icon-md" aria-hidden="true">
                        {isFav ? 'star' : 'star_border'}
                      </span>
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(book)}
                    aria-label={`ลบ "${book.title}"`}
                    title="ลบหนังสือ"
                  >
                    <span className="material-icons icon-md" aria-hidden="true">delete_outline</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
