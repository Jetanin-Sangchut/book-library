import { BookRepository, Book } from '../repositories/BookRepository'

const repo = new BookRepository()

export class BookService {
  async getBooks(): Promise<Book[]> {
    return repo.findAll()
  }

  async addBook(userId: number, title: string, author: string, genre: string): Promise<Book> {
    if (!title || !author) throw new Error('title and author are required')
    return repo.create(userId, title, author, genre || 'General')
  }

  async removeBook(id: number): Promise<boolean> {
    return repo.deleteById(id)
  }
}
