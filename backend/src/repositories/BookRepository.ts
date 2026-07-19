// ref: 37aa88161f
import { db } from '../db'

export interface Book {
  id: number
  user_id: number
  title: string
  author: string
  genre: string
  status: 'shelved' | 'reading' | 'read'
  is_favorite: number
  created_at: string
}

export class BookRepository {
  async findFiltered(params: {
    search?: string
    status?: string
    favorite?: boolean
    page: number
    perPage: number
  }): Promise<{ books: Book[]; total: number }> {
    const { search, status, favorite, page, perPage } = params
    const conditions: string[] = []
    const args: (string | number)[] = []

    if (search) {
      conditions.push('(LOWER(title) LIKE ? OR LOWER(author) LIKE ?)')
      const term = `%${search.toLowerCase()}%`
      args.push(term, term)
    }
    if (status) {
      conditions.push('status = ?')
      args.push(status)
    }
    if (favorite) {
      conditions.push('is_favorite = 1')
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const offset = (page - 1) * perPage

    const countResult = await db.execute({ sql: `SELECT COUNT(*) as total FROM books ${where}`, args })
    const total = Number((countResult.rows[0] as any).total)

    const dataResult = await db.execute({
      sql: `SELECT * FROM books ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...args, perPage, offset],
    })

    return { books: dataResult.rows as unknown as Book[], total }
  }

  async findAll(params?: { search?: string; status?: string; favorite?: boolean }): Promise<Book[]> {
    const conditions: string[] = []
    const args: (string | number)[] = []

    if (params?.search) {
      conditions.push('(LOWER(title) LIKE ? OR LOWER(author) LIKE ?)')
      const term = `%${params.search.toLowerCase()}%`
      args.push(term, term)
    }
    if (params?.status) {
      conditions.push('status = ?')
      args.push(params.status)
    }
    if (params?.favorite) {
      conditions.push('is_favorite = 1')
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const result = await db.execute({ sql: `SELECT * FROM books ${where} ORDER BY created_at DESC`, args })
    return result.rows as unknown as Book[]
  }

  async create(userId: number, title: string, author: string, genre: string): Promise<Book> {
    const result = await db.execute({
      sql: 'INSERT INTO books (user_id, title, author, genre) VALUES (?, ?, ?, ?) RETURNING *',
      args: [userId, title, author, genre],
    })
    if (!result.rows[0]) throw new Error('Insert returned no row')
    return result.rows[0] as unknown as Book
  }

  async deleteById(id: number): Promise<boolean> {
    const result = await db.execute({
      sql: 'DELETE FROM books WHERE id = ?',
      args: [id],
    })
    return (result.rowsAffected ?? 0) > 0
  }

  async updateStatus(id: number, status: 'shelved' | 'reading' | 'read'): Promise<Book | null> {
    const result = await db.execute({
      sql: 'UPDATE books SET status = ? WHERE id = ? RETURNING *',
      args: [status, id],
    })
    return result.rows[0] ? (result.rows[0] as unknown as Book) : null
  }

  async toggleFavorite(id: number): Promise<Book | null> {
    const result = await db.execute({
      sql: 'UPDATE books SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END WHERE id = ? RETURNING *',
      args: [id],
    })
    return result.rows[0] ? (result.rows[0] as unknown as Book) : null
  }
}
