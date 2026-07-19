import type { BookFormData, BookResponse, BookCollectionResponse, LoginResponse } from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
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
    return new Promise<Response>(() => {}) // navigation underway, never resolves
  }
  return res
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

export async function getBooks(): Promise<BookCollectionResponse> {
  const res = await apiFetch('/api/books')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message ?? `Failed to fetch books (HTTP ${res.status})`)
  }
  return res.json()
}

export async function addBook(data: BookFormData): Promise<BookResponse> {
  const res = await apiFetch('/api/books', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error?.message ?? 'Failed to add book')
  }
  return res.json()
}

export async function deleteBook(id: number): Promise<void> {
  const res = await apiFetch(`/api/books/${id}`, { method: 'DELETE' })
  // DELETE returns 204 No Content on success; any non-ok status is an error
  if (!res.ok) throw new Error(`Failed to delete book (HTTP ${res.status})`)
}
