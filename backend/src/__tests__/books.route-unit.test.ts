import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

// Mock controller — all handlers succeed
vi.mock('../controllers/BookController', () => ({
  BookController: {
    list: vi.fn((_req: any, res: any) =>
      res.json({ type: 'BookCollection', count: 0, meta: { total: 0, page: 1, perPage: 20 }, books: [] })
    ),
    export: vi.fn((_req: any, res: any) =>
      res.json({ type: 'BookCollection', exported_at: new Date().toISOString(), count: 0, books: [] })
    ),
    create: vi.fn((_req: any, res: any) =>
      res.status(201).json({ type: 'Book', book: { id: 1, title: 'T', author: 'A' } })
    ),
    delete: vi.fn((_req: any, res: any) => res.status(204).send()),
    updateStatus: vi.fn((_req: any, res: any) =>
      res.json({ type: 'Book', book: { id: 1, status: 'reading' } })
    ),
    toggleFavorite: vi.fn((_req: any, res: any) =>
      res.json({ type: 'Book', book: { id: 1, is_favorite: 1 } })
    ),
  },
}))

// Mock auth middleware — always passes in unit tests
vi.mock('../middleware/auth', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = { id: 1, username: 'alice' }
    next()
  },
}))

import bookRoutes from '../routes/books'

const app = express()
app.use(express.json())
app.use('/api/books', bookRoutes)

describe('Books routes — wiring unit tests (mocked controller)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('GET /api/books → list handler', async () => {
    const res = await request(app).get('/api/books')
    expect(res.status).toBe(200)
    expect(res.body.type).toBe('BookCollection')
    expect(res.body.meta).toBeDefined()
  })

  it('GET /api/books/export → export handler (must match before /:id)', async () => {
    const res = await request(app).get('/api/books/export')
    expect(res.status).toBe(200)
    expect(res.body.type).toBe('BookCollection')
    expect(res.body.exported_at).toBeDefined()
  })

  it('POST /api/books → create handler with mocked auth', async () => {
    const res = await request(app).post('/api/books').send({ title: 'T', author: 'A', genre: 'G' })
    expect(res.status).toBe(201)
    expect(res.body.type).toBe('Book')
  })

  it('DELETE /api/books/1 → delete handler', async () => {
    const res = await request(app).delete('/api/books/1')
    expect(res.status).toBe(204)
  })

  it('PATCH /api/books/1/status → updateStatus handler', async () => {
    const res = await request(app).patch('/api/books/1/status').send({ status: 'reading' })
    expect(res.status).toBe(200)
    expect(res.body.book.status).toBe('reading')
  })

  it('PATCH /api/books/1/favorite → toggleFavorite handler', async () => {
    const res = await request(app).patch('/api/books/1/favorite')
    expect(res.status).toBe(200)
    expect(res.body.book.is_favorite).toBe(1)
  })
})
