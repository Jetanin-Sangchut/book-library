export type BookStatus = 'shelved' | 'reading' | 'read'

export type Book = {
  id: number
  user_id: number
  title: string
  author: string
  genre: string
  status: BookStatus
  is_favorite: number
  created_at: string
}

export type BookFormData = {
  title: string
  author: string
  genre: string
}

export type Meta = {
  total: number
  page: number
  perPage: number
}

export type LoginResponse = {
  type: 'Auth'
  token: string
  username: string
}

export type BookCollectionResponse = {
  type: 'BookCollection'
  count: number
  meta: Meta
  books: Book[]
}

export type BookResponse = {
  type: 'Book'
  book: Book
}
