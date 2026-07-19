import { BookRepository, Book } from '../repositories/BookRepository'

const repo = new BookRepository()

export class BookService {
  async getFilteredBooks(params: {
    search?: string
    status?: string
    favorite?: boolean
    page: number
    perPage: number
  }): Promise<{ books: Book[]; total: number }> {
    return repo.findFiltered(params)
  }

  async getAllBooks(params?: { search?: string; status?: string; favorite?: boolean }): Promise<Book[]> {
    return repo.findAll(params)
  }

  async addBook(userId: number, title: string, author: string, genre: string): Promise<Book> {
    if (!title || !author) throw new Error('title and author are required')
    return repo.create(userId, title, author, genre || 'General')
  }

  async removeBook(id: number): Promise<boolean> {
    return repo.deleteById(id)
  }

  async updateBookStatus(id: number, status: string): Promise<Book | null> {
    const valid = ['shelved', 'reading', 'read']
    if (!valid.includes(status)) throw new Error('Invalid status')
    return repo.updateStatus(id, status as 'shelved' | 'reading' | 'read')
  }

  async toggleBookFavorite(id: number): Promise<Book | null> {
    return repo.toggleFavorite(id)
  }
}
