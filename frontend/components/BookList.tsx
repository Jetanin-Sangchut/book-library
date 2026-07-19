'use client'

import Swal from 'sweetalert2'
import { Book, BookStatus } from '@/types'

type Props = {
  books: Book[]
  onDelete: (id: number) => Promise<void>
  onStatusChange: (id: number, status: string) => Promise<void>
  onToggleFavorite: (id: number) => Promise<void>
}

const STATUS_CONFIG: Record<BookStatus, { label: string; color: string }> = {
  shelved: { label: 'อยู่บนชั้น', color: 'var(--tertiary)' },
  reading: { label: 'กำลังอ่าน', color: 'var(--primary)' },
  read:    { label: 'อ่านแล้ว',   color: 'var(--muted)' },
}

function getStatusDisplay(book: Book): { label: string; color: string } {
  if (book.status === 'shelved' && book.is_favorite) {
    return { label: '★ อยากอ่าน', color: 'var(--primary)' }
  }
  return STATUS_CONFIG[book.status] ?? STATUS_CONFIG.shelved
}

function nextStatus(current: BookStatus): BookStatus {
  const cycle: BookStatus[] = ['shelved', 'reading', 'read']
  return cycle[(cycle.indexOf(current) + 1) % 3]
}

export default function BookList({ books, onDelete, onStatusChange, onToggleFavorite }: Props) {
  const handleDelete = async (book: Book) => {
    const result = await Swal.fire({
      title: `ต้องการลบ "${book.title}" หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#3E5A3A',
      customClass: { popup: 'rounded-lg' },
    })
    if (result.isConfirmed) await onDelete(book.id)
  }

  if (books.length === 0) {
    return (
      <div className="card text-center py-16">
        <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>ยังไม่มีหนังสือในคลัง</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>กรอกข้อมูลด้านบนเพื่อเพิ่มเล่มแรก</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {books.map(book => {
        const { label, color } = getStatusDisplay(book)
        return (
          <div key={book.id} className="card flex items-center justify-between px-4 py-3 transition-all">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{book.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{book.author}</p>
            </div>
            <div className="flex items-center gap-2 ml-4 flex-shrink-0 flex-wrap justify-end">
              {/* Genre badge */}
              {book.genre && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline-flex" style={{ backgroundColor: 'rgba(168, 159, 144, 0.18)', color: 'var(--muted)' }}>
                  {book.genre}
                </span>
              )}
              {/* Status badge — click to cycle */}
              <button
                onClick={() => onStatusChange(book.id, nextStatus(book.status ?? 'shelved'))}
                style={{ border: `1px solid ${color}`, color, borderRadius: '4px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', background: 'transparent' }}
                aria-label={`สถานะ: ${label} — คลิกเพื่อเปลี่ยน`}
                title="คลิกเพื่อเปลี่ยนสถานะ"
              >
                {label}
              </button>
              {/* Favorite star (always shown) */}
              <button
                onClick={() => onToggleFavorite(book.id)}
                style={{ fontSize: '1rem', lineHeight: 1, background: 'transparent', border: 'none', cursor: 'pointer', color: book.is_favorite ? 'var(--primary)' : 'var(--tertiary)' }}
                aria-label={book.is_favorite ? 'ถอดออกจากรายการอยากอ่าน' : 'เพิ่มในรายการอยากอ่าน'}
                title={book.is_favorite ? 'ถอดออกจาก wishlist' : 'เพิ่มใน wishlist'}
              >
                {book.is_favorite ? '★' : '☆'}
              </button>
              {/* Delete */}
              <button onClick={() => handleDelete(book)} className="btn btn-ghost text-xs" aria-label={`ลบ "${book.title}"`}>
                ลบ
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
