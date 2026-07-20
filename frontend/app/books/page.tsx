'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import BookForm from '@/components/BookForm'
import BookList from '@/components/BookList'
import Pagination from '@/components/Pagination'
import { getBooks, addBook, deleteBook, updateBookStatus, toggleFavorite, exportBooks } from '@/lib/api'
import type { Book, BookFormData, Meta } from '@/types'

// ref: 37aa88161f

const EMPTY_FORM: BookFormData = { title: '', author: '', genre: '' }
const DEFAULT_META: Meta = { total: 0, page: 1, perPage: 20 }

export default function BooksPage() {
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [meta, setMeta] = useState<Meta>(DEFAULT_META)
  const [formData, setFormData] = useState<BookFormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [perPage, setPerPage] = useState(20)
  const [page, setPage] = useState(1)
  const [ready, setReady] = useState(false)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const skipNextDebounce = useRef(false)

  // Auth guard
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login')
    } else {
      setReady(true)
    }
  }, [router])

  const fetchBooks = useCallback(async (opts: { search: string; status: string; page: number; perPage: number }) => {
    if (!localStorage.getItem('token')) return
    setLoading(true)
    try {
      const res = await getBooks({
        page: opts.page,
        perPage: opts.perPage,
        search: opts.search || undefined,
        status: opts.status || undefined,
      })
      setBooks(res.books)
      setMeta(res.meta ?? DEFAULT_META)
    } catch (err: unknown) {
      console.error('[BooksPage] getBooks failed', err)
      setError('โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }, [])

  // Single debounced effect — covers initial mount, search, filter, page, perPage
  useEffect(() => {
    if (skipNextDebounce.current) { skipNextDebounce.current = false; return }
    const timer = setTimeout(() => {
      fetchBooks({ search: searchQuery, status: filterStatus, page, perPage })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, filterStatus, page, perPage, fetchBooks])

  const handleAdd = async (data: BookFormData) => {
    setLoading(true)
    setError(null)
    try {
      await addBook(data)
      skipNextDebounce.current = true
      setPage(1)
      await fetchBooks({ search: searchQuery, status: filterStatus, page: 1, perPage })
      setFormData(EMPTY_FORM)
      titleInputRef.current?.focus()
      Swal.fire({
        icon: 'success',
        title: 'เพิ่มหนังสือเรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'rounded-lg' },
      })
    } catch (err: unknown) {
      console.error('[BooksPage] addBook failed', err)
      setError(err instanceof Error ? err.message : 'เพิ่มหนังสือไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    setError(null)
    try {
      await deleteBook(id)
      await fetchBooks({ search: searchQuery, status: filterStatus, page, perPage })
    } catch (err: unknown) {
      console.error('[BooksPage] deleteBook failed', id, err)
      setError(err instanceof Error ? err.message : 'ลบหนังสือไม่สำเร็จ')
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    setError(null)
    try {
      const res = await updateBookStatus(id, status)
      setBooks(prev => prev.map(b => b.id === id ? res.book : b))
    } catch (err: unknown) {
      console.error('[BooksPage] updateStatus failed', id, err)
      setError('อัปเดต status ไม่สำเร็จ')
    }
  }

  const handleToggleFavorite = async (id: number) => {
    setError(null)
    try {
      const res = await toggleFavorite(id)
      setBooks(prev => prev.map(b => b.id === id ? res.book : b))
    } catch (err: unknown) {
      console.error('[BooksPage] toggleFavorite failed', id, err)
      setError('อัปเดต favorite ไม่สำเร็จ')
    }
  }

  const handleExport = async () => {
    try {
      await exportBooks({
        search: searchQuery || undefined,
        status: filterStatus || undefined,
      })
    } catch {
      setError('ดาวน์โหลดไม่สำเร็จ')
    }
  }

  const handleFilterStatus = (value: string) => {
    setFilterStatus(value)
    setPage(1)
  }

  const handlePerPageChange = (value: number) => {
    setPerPage(value)
    setPage(1)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const isInitialLoad = loading && books.length === 0

  if (!ready) return null

  return (
    <main className="min-h-screen">
      <header
        className="page-header sticky top-0 z-10 border-b px-6 py-4 flex items-center justify-between backdrop-blur-sm"
      >
        <h1 className="text-display text-sm font-medium tracking-tight">
          Book Library
        </h1>
        <button onClick={handleLogout} className="btn btn-ghost text-xs">
          ออกจากระบบ
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <BookForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAdd}
          loading={loading}
          titleInputRef={titleInputRef}
        />

        {error && <p className="error-banner mb-4" role="alert">{error}</p>}

        {/* Filter bar card */}
        <div className="card px-5 py-4 mb-6">
          {/* Row 1: search full-width */}
          <div className="mb-3">
            <input
              className="input-field"
              placeholder="ค้นหาชื่อ / ผู้แต่ง..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="ค้นหาหนังสือ"
            />
          </div>
          {/* Row 2: status col-6 | export col-3 | clear col-3 */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-12 md:col-span-6">
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={e => handleFilterStatus(e.target.value)}
                className="input-field"
                aria-label="กรองตามสถานะ"
              >
                <option value="">ทั้งหมด</option>
                <option value="shelved">อยู่บนชั้น</option>
                <option value="reading">กำลังอ่าน</option>
                <option value="read">อ่านแล้ว</option>
              </select>
            </div>
            <div className="col-span-6 md:col-span-3">
              <button
                onClick={handleExport}
                className="btn btn-ghost w-full justify-center text-xs"
                aria-label="ส่งออกรายการหนังสือเป็น JSON"
                title="ส่งออก JSON"
              >
                ↓ ส่งออก JSON
              </button>
            </div>
            <div className="col-span-6 md:col-span-3">
              <button
                onClick={() => { setSearchQuery(''); handleFilterStatus('') }}
                disabled={!searchQuery && !filterStatus}
                className="btn btn-ghost text-danger w-full justify-center text-xs disabled:opacity-40"
                aria-label="ล้างตัวกรองทั้งหมด"
              >
                ✕ ล้างตัวกรอง
              </button>
            </div>
          </div>
        </div>

        {/* Count + limit — above grid, outside card */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm">
            แสดง {books.length} จาก {meta.total} เล่ม
          </span>
          <select
            value={perPage}
            onChange={e => handlePerPageChange(Number(e.target.value))}
            className="input-field w-auto"
            aria-label="จำนวนต่อหน้า"
          >
            <option value={10}>แสดง 10</option>
            <option value={20}>แสดง 20</option>
            <option value={30}>แสดง 30</option>
          </select>
        </div>

        {isInitialLoad && (
          <div className="book-skeleton-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="book-skeleton-item">
                <div className="animate-pulse book-skeleton-cover" />
                <div className="book-skeleton-body">
                  <div className="animate-pulse book-skeleton-line book-skeleton-line--title" />
                  <div className="animate-pulse book-skeleton-line book-skeleton-line--author" />
                  <div className="animate-pulse book-skeleton-line book-skeleton-line--genre" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isInitialLoad && (
          <div className="book-list-fade" data-loading={loading} aria-busy={loading}>
            <BookList
              books={books}
              hasActiveFilters={!!(searchQuery || filterStatus)}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}

        <Pagination
          meta={meta}
          onChange={p => setPage(p)}
        />
      </div>
    </main>
  )
}
