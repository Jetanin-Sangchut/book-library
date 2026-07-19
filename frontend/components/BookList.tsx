'use client'

import Swal from 'sweetalert2'
import { Book } from '@/types'

type Props = {
  books: Book[]
  onDelete: (id: number) => Promise<void>
}

export default function BookList({ books, onDelete }: Props) {
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
      {books.map(book => (
        <div key={book.id} className="card flex items-center justify-between px-4 py-3 transition-all">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{book.title}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{book.author}</p>
          </div>
          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
            {book.genre && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(168, 159, 144, 0.18)', color: 'var(--muted)' }}>
                {book.genre}
              </span>
            )}
            <button onClick={() => handleDelete(book)} className="btn btn-ghost text-xs" aria-label={`ลบ "${book.title}"`}>
              ลบ
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
