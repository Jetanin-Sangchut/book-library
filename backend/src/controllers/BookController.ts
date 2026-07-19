import { Request, Response } from 'express'
import { BookService } from '../services/BookService'

const service = new BookService()

export const BookController = {
  async list(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1)
      const perPage = Math.min(100, Math.max(1, parseInt(req.query.perPage as string) || 20))
      const search = (req.query.search as string) || undefined
      const status = (req.query.status as string) || undefined
      const favorite = req.query.favorite === '1' || req.query.favorite === 'true'

      const { books, total } = await service.getFilteredBooks({
        search, status, favorite: favorite || undefined, page, perPage,
      })

      res.json({ type: 'BookCollection', count: books.length, meta: { total, page, perPage }, books })
    } catch {
      res.status(500).json({ type: 'Error', error: { code: 'INTERNAL', message: 'Failed to fetch books' } })
    }
  },

  async export(req: Request, res: Response) {
    try {
      const search = (req.query.search as string) || undefined
      const status = (req.query.status as string) || undefined
      const favorite = req.query.favorite === '1' || req.query.favorite === 'true'

      const books = await service.getAllBooks({ search, status, favorite: favorite || undefined })

      res.setHeader('Content-Disposition', 'attachment; filename="books-export.json"')
      res.json({
        type: 'BookCollection',
        exported_at: new Date().toISOString(),
        filters: { search, status, favorite: favorite || undefined },
        count: books.length,
        books,
      })
    } catch {
      res.status(500).json({ type: 'Error', error: { code: 'INTERNAL', message: 'Failed to export books' } })
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
    } catch {
      res.status(500).json({ type: 'Error', error: { code: 'INTERNAL', message: 'Failed to delete book' } })
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) return res.status(400).json({ type: 'Error', error: { code: 'BAD_REQUEST', message: 'Invalid book id' } })
      const book = await service.updateBookStatus(id, req.body.status)
      if (!book) return res.status(404).json({ type: 'Error', error: { code: 'NOT_FOUND', message: 'Book not found' } })
      res.json({ type: 'Book', book })
    } catch (err: any) {
      const status = err.message.includes('Invalid') ? 400 : 500
      res.status(status).json({ type: 'Error', error: { code: 'BAD_REQUEST', message: err.message } })
    }
  },

  async toggleFavorite(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id)
      if (isNaN(id)) return res.status(400).json({ type: 'Error', error: { code: 'BAD_REQUEST', message: 'Invalid book id' } })
      const book = await service.toggleBookFavorite(id)
      if (!book) return res.status(404).json({ type: 'Error', error: { code: 'NOT_FOUND', message: 'Book not found' } })
      res.json({ type: 'Book', book })
    } catch {
      res.status(500).json({ type: 'Error', error: { code: 'INTERNAL', message: 'Failed to toggle favorite' } })
    }
  },
}
