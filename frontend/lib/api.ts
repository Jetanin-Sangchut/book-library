import type { BookFormData, BookResponse, BookCollectionResponse, LoginResponse } from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!BASE) throw new Error('[api] NEXT_PUBLIC_API_URL is not set. Add it to .env.local')
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.replace('/login')
    return new Promise<T>(() => {}) // navigation underway, never resolves
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message ?? `Request failed (HTTP ${res.status})`)
  }
  return res.json()
}

export type BooksParams = {
  page?: number
  perPage?: number
  search?: string
  status?: string
  favorite?: boolean
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error?.message ?? data?.error ?? 'Login failed')
  }
  return res.json()
}

export async function getBooks(params?: BooksParams): Promise<BookCollectionResponse> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.perPage) query.set('perPage', String(params.perPage))
  if (params?.search) query.set('search', params.search)
  if (params?.status) query.set('status', params.status)
  if (params?.favorite) query.set('favorite', '1')
  const qs = query.toString()
  return apiFetch<BookCollectionResponse>(`/api/books${qs ? `?${qs}` : ''}`)
}

export async function addBook(data: BookFormData): Promise<BookResponse> {
  return apiFetch<BookResponse>('/api/books', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deleteBook(id: number): Promise<void> {
  if (!BASE) throw new Error('[api] NEXT_PUBLIC_API_URL is not set')
  const token = getToken()
  const res = await fetch(`${BASE}/api/books/${id}`, {
    method: 'DELETE',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.replace('/login')
    return new Promise<void>(() => {})
  }
  if (!res.ok) throw new Error(`Failed to delete book (HTTP ${res.status})`)
}

export async function updateBookStatus(id: number, status: string): Promise<BookResponse> {
  return apiFetch<BookResponse>(`/api/books/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function toggleFavorite(id: number): Promise<BookResponse> {
  return apiFetch<BookResponse>(`/api/books/${id}/favorite`, { method: 'PATCH' })
}

export async function exportBooks(params?: Omit<BooksParams, 'page' | 'perPage'>): Promise<void> {
  if (!BASE) throw new Error('[api] NEXT_PUBLIC_API_URL is not set')
  const token = getToken()
  const query = new URLSearchParams()
  if (params?.search) query.set('search', params.search)
  if (params?.status) query.set('status', params.status)
  if (params?.favorite) query.set('favorite', '1')
  const qs = query.toString()
  const res = await fetch(`${BASE}/api/books/export${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  })
  if (!res.ok) throw new Error('Export failed')
  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'books-export.json'
  a.click()
  URL.revokeObjectURL(a.href)
}
