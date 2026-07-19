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
  const [page, setPage] = useState(1)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const addedSuccessfully = useRef(false)
  const isMounted = useRef(false)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auth guard
  useEffect(() => {
    if (!localStorage.getItem('token')) router.replace('/login')
  }, [router])

  const fetchBooks = useCallback(async (opts: { search: string; status: string; page: number }) => {
    if (!localStorage.getItem('token')) return
    setLoading(true)
    try {
      const isFavoriteFilter = opts.status === 'favorite'
      const res = await getBooks({
        page: opts.page,
        perPage: 20,
        search: opts.search || undefined,
        status: !isFavoriteFilter && opts.status ? opts.status : undefined,
        favorite: isFavoriteFilter || undefined,
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

  // Re-fetch on page or status filter change (also fires on initial mount)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      fetchBooks({ search: '', status: '', page: 1 })
      return
    }
    fetchBooks({ search: searchQuery, status: filterStatus, page })
  }, [page, filterStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search — resets page to 1
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setPage(1)
      fetchBooks({ search: searchQuery, status: filterStatus, page: 1 })
    }, 300)
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current) }
  }, [searchQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  // SweetAlert2 on ADD only — flag set in handleAdd, cleared here
  useEffect(() => {
    if (!addedSuccessfully.current) return
    addedSuccessfully.current = false
    Swal.fire({
      icon: 'success',
      title: 'เพิ่มหนังสือเรียบร้อยแล้ว',
      timer: 1500,
      showConfirmButton: false,
      customClass: { popup: 'rounded-lg' },
    })
  }, [books])

  const handleAdd = async (data: BookFormData) => {
    setLoading(true)
    setError(null)
    try {
      await addBook(data)
      addedSuccessfully.current = true
      setPage(1)
      await fetchBooks({ search: searchQuery, status: filterStatus, page: 1 })
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
      await fetchBooks({ search: searchQuery, status: filterStatus, page })
    } catch (err: unknown) {
      console.error('[BooksPage] deleteBook failed', id, err)
      setError(err instanceof Error ? err.message : 'ลบหนังสือไม่สำเร็จ')
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await updateBookStatus(id, status)
      setBooks(prev => prev.map(b => b.id === id ? res.book : b))
    } catch (err: unknown) {
      console.error('[BooksPage] updateStatus failed', id, err)
      setError('อัปเดต status ไม่สำเร็จ')
    }
  }

  const handleToggleFavorite = async (id: number) => {
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
      const isFavoriteFilter = filterStatus === 'favorite'
      await exportBooks({
        search: searchQuery || undefined,
        status: !isFavoriteFilter && filterStatus ? filterStatus : undefined,
        favorite: isFavoriteFilter || undefined,
      })
    } catch {
      setError('ดาวน์โหลดไม่สำเร็จ')
    }
  }

  const handleFilterStatus = (value: string) => {
    setFilterStatus(value)
    setPage(1)
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

        {/* Filter bar: col-2 count | col-5 search | col-3 status | col-2 export */}
        <div className="grid grid-cols-12 gap-3 items-center mb-4">
          <p className="col-span-2 max-[575px]:col-span-12 text-sm" style={{ color: 'var(--muted)' }}>
            {meta.total} เล่ม
          </p>
          <div className="col-span-5 max-[575px]:col-span-12">
            <input
              className="input-field text-sm w-full"
              placeholder="ค้นหาชื่อ / ผู้แต่ง..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="ค้นหาหนังสือ"
              style={{ padding: '6px 12px' }}
            />
          </div>
          <div className="col-span-3 max-[575px]:col-span-12">
            <select
              value={filterStatus}
              onChange={e => handleFilterStatus(e.target.value)}
              className="input-field text-xs w-full"
              style={{ padding: '6px 12px' }}
              aria-label="กรองตามสถานะ"
            >
              <option value="">ทั้งหมด</option>
              <option value="shelved">อยู่บนชั้น</option>
              <option value="reading">กำลังอ่าน</option>
              <option value="read">อ่านแล้ว</option>
              <option value="favorite">★ อยากอ่าน</option>
            </select>
          </div>
          <div className="col-span-2 max-[575px]:col-span-12 flex justify-end">
            <button
              onClick={handleExport}
              className="btn btn-ghost text-xs"
              aria-label="ส่งออกรายการหนังสือเป็น JSON"
              title="ส่งออก JSON"
            >
              ↓ Export
            </button>
          </div>
        </div>

        {loading && books.length === 0 && (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-14 animate-pulse" />
            ))}
          </div>
        )}

        {(!loading || books.length > 0) && (
          <BookList
            books={books}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        <Pagination
          meta={meta}
          onChange={p => setPage(p)}
        />
      </div>
    </main>
  )
}
