export type Book = {
  id: number
  user_id: number
  title: string
  author: string
  genre: string
  created_at: string
}

export type BookFormData = {
  title: string
  author: string
  genre: string
}

export type LoginResponse = {
  type: 'Auth'
  token: string
  username: string
}

export type BookCollectionResponse = {
  type: 'BookCollection'
  count: number
  books: Book[]
}

export type BookResponse = {
  type: 'Book'
  book: Book
}
