'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import BookForm from '@/components/BookForm'
import BookList from '@/components/BookList'
import { getBooks, addBook, deleteBook } from '@/lib/api'
import type { Book, BookFormData } from '@/types'

// ref: 37aa88161f

const EMPTY_FORM: BookFormData = { title: '', author: '', genre: '' }

export default function BooksPage() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [formData, setFormData] = useState<BookFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterGenre, setFilterGenre] = useState('')

  const titleInputRef = useRef<HTMLInputElement>(null)
  const prevBooksCount = useRef<number | null>(null)

  // Auth guard
  useEffect(() => {
    if (!localStorage.getItem('token')) router.replace('/login')
  }, [router])

  // Initial fetch — guard with token to avoid 401 race with auth redirect
  useEffect(() => {
    if (!localStorage.getItem('token')) return
    setLoading(true)
    getBooks()
      .then(res => {
        prevBooksCount.current = res.books.length
        setBooks(res.books)
      })
      .catch((err: unknown) => {
        console.error('[BooksPage] getBooks failed', err)
        setError('โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่')
      })
      .finally(() => setLoading(false))
  }, [])

  // SweetAlert2 on ADD only
  useEffect(() => {
    if (prevBooksCount.current === null) return
    if (books.length > prevBooksCount.current) {
      Swal.fire({
        icon: 'success',
        title: 'เพิ่มหนังสือเรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'rounded-lg' },
      })
    }
    prevBooksCount.current = books.length
  }, [books])

  const genres = useMemo(() => Array.from(new Set(books.map(b => b.genre).filter(Boolean))), [books])
  const filteredBooks = useMemo(
    () => (filterGenre ? books.filter(b => b.genre === filterGenre) : books),
    [books, filterGenre]
  )

  const handleAdd = async (data: BookFormData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await addBook(data)
      setBooks(prev => [res.book, ...prev])
      setFormData(EMPTY_FORM)
      titleInputRef.current?.focus()
    } catch (err: unknown) {
      console.error('[BooksPage] addBook failed', err)
      setError(err instanceof Error ? err.message : 'เพิ่มหนังสือไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteBook(id)
      setBooks(prev => prev.filter(b => b.id !== id))
    } catch (err: unknown) {
      console.error('[BooksPage] deleteBook failed', id, err)
      setError(err instanceof Error ? err.message : 'ลบหนังสือไม่สำเร็จ')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <main className="min-h-screen">
      <header
        className="sticky top-0 z-10 border-b px-6 py-4 flex items-center justify-between backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(244, 238, 223, 0.90)', borderColor: 'var(--border-divider)' }}
      >
        <h1 className="text-display text-sm font-medium tracking-tight" style={{ color: 'var(--ink)' }}>
          Book Library
        </h1>
        <button onClick={handleLogout} className="btn btn-ghost text-xs">
          ออกจากระบบ
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <BookForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAdd}
          loading={loading}
          titleInputRef={titleInputRef}
        />

        {error && <p className="error-banner mb-4" role="alert">{error}</p>}

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {filteredBooks.length} {filterGenre ? `เล่มในหมวด "${filterGenre}"` : 'เล่มทั้งหมด'}
          </p>
          {genres.length > 0 && (
            <select
              value={filterGenre}
              onChange={e => setFilterGenre(e.target.value)}
              className="input-field text-xs w-auto"
              style={{ padding: '6px 12px' }}
            >
              <option value="">ทุกหมวดหมู่</option>
              {genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          )}
        </div>

        {loading && books.length === 0 && (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-14 animate-pulse" />
            ))}
          </div>
        )}

        {(!loading || books.length > 0) && (
          <BookList books={filteredBooks} onDelete={handleDelete} />
        )}
      </div>
    </main>
  )
}
