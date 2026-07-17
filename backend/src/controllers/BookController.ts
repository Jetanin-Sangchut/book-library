import { Request, Response } from 'express'
import { BookService } from '../services/BookService'

const service = new BookService()

export const BookController = {
  async list(req: Request, res: Response) {
    try {
      const books = await service.getBooks()
      res.json({
        type: 'BookCollection',
        count: books.length,
        books,
      })
    } catch (err) {
      res.status(500).json({ type: 'Error', error: { code: 'INTERNAL', message: 'Failed to fetch books' } })
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { title, author, genre } = req.body
      const userId = req.user!.id
      const book = await service.addBook(userId, title, author, genre)
      res.status(201).json({ type: 'Book', book })
    } catch (err: any) {
      const status = err.message.includes('required') ? 400 : 500
      res.status(status).json({ type: 'Error', error: { code: 'BAD_REQUEST', message: err.message } })
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) return res.status(400).json({ type: 'Error', error: { code: 'BAD_REQUEST', message: 'Invalid book id' } })
      const deleted = await service.removeBook(id)
      if (!deleted) return res.status(404).json({ type: 'Error', error: { code: 'NOT_FOUND', message: 'Book not found' } })
      res.status(204).send()
    } catch (err) {
      res.status(500).json({ type: 'Error', error: { code: 'INTERNAL', message: 'Failed to delete book' } })
    }
  },
}
