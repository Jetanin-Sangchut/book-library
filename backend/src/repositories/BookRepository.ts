// ref: 37aa88161f
import { db } from '../db'

export interface Book {
  id: number
  user_id: number
  title: string
  author: string
  genre: string
  created_at: string
}

export class BookRepository {
  async findAll(): Promise<Book[]> {
    const result = await db.execute('SELECT * FROM books ORDER BY created_at DESC')
    return result.rows as unknown as Book[]
  }

  async findByUserId(userId: number): Promise<Book[]> {
    const result = await db.execute({
      sql: 'SELECT * FROM books WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId],
    })
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
}
