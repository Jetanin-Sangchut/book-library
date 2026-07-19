import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { app, auth } from './helpers/setup'

// Obtain JWT token once before all tests
beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'alice', password: 'password123' })
  expect(res.status).toBe(200)
  expect(res.body.token).toBeDefined()
  auth.token = res.body.token
})

// ─── GET /api/books — pagination ───────────────────────────────────────────

describe('GET /api/books — pagination', () => {
  it('returns BookCollection envelope with meta', async () => {
    const res = await request(app).get('/api/books')
    expect(res.status).toBe(200)
    expect(res.body.type).toBe('BookCollection')
    expect(res.body.meta).toMatchObject({
      page: expect.any(Number),
      perPage: expect.any(Number),
      total: expect.any(Number),
    })
    expect(res.body.books).toEqual(expect.any(Array))
  })

  it('respects perPage=2 — at most 2 books returned', async () => {
    const res = await request(app).get('/api/books?page=1&perPage=2')
    expect(res.status).toBe(200)
    expect(res.body.books.length).toBeLessThanOrEqual(2)
    expect(res.body.meta.perPage).toBe(2)
  })

  it('page 2 offset differs from page 1 (when enough data)', async () => {
    const p1 = await request(app).get('/api/books?page=1&perPage=2')
    const p2 = await request(app).get('/api/books?page=2&perPage=2')
    expect(p1.status).toBe(200)
    expect(p2.status).toBe(200)
    if (p2.body.books.length > 0 && p1.body.books.length > 0) {
      expect(p1.body.books[0].id).not.toBe(p2.body.books[0].id)
    }
  })
})

// ─── GET /api/books — search ────────────────────────────────────────────────

describe('GET /api/books — search', () => {
  it('filters results by title keyword', async () => {
    const res = await request(app).get('/api/books?search=clean')
    expect(res.status).toBe(200)
    if (res.body.books.length > 0) {
      expect(res.body.books.every((b: any) =>
        b.title.toLowerCase().includes('clean') ||
        b.author.toLowerCase().includes('clean')
      )).toBe(true)
    }
  })

  it('returns empty list for non-existent search term', async () => {
    const res = await request(app).get('/api/books?search=xyznotfound999abc')
    expect(res.status).toBe(200)
    expect(res.body.books).toHaveLength(0)
    expect(res.body.meta.total).toBe(0)
  })
})

// ─── GET /api/books — status filter ─────────────────────────────────────────

describe('GET /api/books — status filter', () => {
  it('returns only shelved books when status=shelved', async () => {
    const res = await request(app).get('/api/books?status=shelved')
    expect(res.status).toBe(200)
    if (res.body.books.length > 0) {
      expect(res.body.books.every((b: any) => b.status === 'shelved')).toBe(true)
    }
  })
})

// ─── PATCH /api/books/:id/status ────────────────────────────────────────────

describe('PATCH /api/books/:id/status', () => {
  let bookId: number | null = null

  beforeAll(async () => {
    const res = await request(app).get('/api/books?perPage=1')
    if (res.body.books.length > 0) bookId = res.body.books[0].id
  })

  it('returns 401 without Authorization header', async () => {
    const id = bookId ?? 1
    const res = await request(app).patch(`/api/books/${id}/status`).send({ status: 'reading' })
    expect(res.status).toBe(401)
  })

  it('updates status to reading with valid token', async () => {
    if (!bookId) { console.warn('ข้ามเพราะไม่พบ bookId จาก DB'); return }
    const res = await request(app)
      .patch(`/api/books/${bookId}/status`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ status: 'reading' })
    expect(res.status).toBe(200)
    expect(res.body.type).toBe('Book')
    expect(res.body.book.status).toBe('reading')
    // Reset back to shelved
    await request(app)
      .patch(`/api/books/${bookId}/status`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ status: 'shelved' })
  })

  it('returns 400 for unknown status value', async () => {
    if (!bookId) { console.warn('ข้ามเพราะไม่พบ bookId จาก DB'); return }
    const res = await request(app)
      .patch(`/api/books/${bookId}/status`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ status: 'not_a_real_status' })
    expect(res.status).toBe(400)
  })
})

// ─── PATCH /api/books/:id/favorite ──────────────────────────────────────────

describe('PATCH /api/books/:id/favorite', () => {
  let bookId: number | null = null

  beforeAll(async () => {
    const res = await request(app).get('/api/books?perPage=1')
    if (res.body.books.length > 0) bookId = res.body.books[0].id
  })

  it('returns 401 without Authorization header', async () => {
    const id = bookId ?? 1
    const res = await request(app).patch(`/api/books/${id}/favorite`)
    expect(res.status).toBe(401)
  })

  it('toggles is_favorite and returns updated book', async () => {
    if (!bookId) { console.warn('ข้ามเพราะไม่พบ bookId จาก DB'); return }
    const before = await request(app).get('/api/books?perPage=1')
    const prevFav = before.body.books[0]?.is_favorite ?? 0

    const res = await request(app)
      .patch(`/api/books/${bookId}/favorite`)
      .set('Authorization', `Bearer ${auth.token}`)
    expect(res.status).toBe(200)
    expect(res.body.book.is_favorite).toBe(prevFav === 0 ? 1 : 0)

    // Toggle back to original
    await request(app)
      .patch(`/api/books/${bookId}/favorite`)
      .set('Authorization', `Bearer ${auth.token}`)
  })
})

// ─── GET /api/books/export ───────────────────────────────────────────────────

describe('GET /api/books/export', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/books/export')
    expect(res.status).toBe(401)
  })

  it('returns BookCollection with exported_at and no pagination meta', async () => {
    const res = await request(app)
      .get('/api/books/export')
      .set('Authorization', `Bearer ${auth.token}`)
    expect(res.status).toBe(200)
    expect(res.body.type).toBe('BookCollection')
    expect(res.body.exported_at).toEqual(expect.any(String))
    expect(res.body.books).toEqual(expect.any(Array))
    expect(res.body.meta).toBeUndefined()
  })

  it('export with search filter returns only matching books', async () => {
    const res = await request(app)
      .get('/api/books/export?search=clean')
      .set('Authorization', `Bearer ${auth.token}`)
    expect(res.status).toBe(200)
    if (res.body.books.length > 0) {
      expect(res.body.books.every((b: any) =>
        b.title.toLowerCase().includes('clean') ||
        b.author.toLowerCase().includes('clean')
      )).toBe(true)
    }
  })
})
