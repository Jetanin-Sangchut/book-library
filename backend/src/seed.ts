import { db } from './db'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('Creating schema...')

  // Create users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  // Create books table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      genre TEXT DEFAULT 'General',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  console.log('Seeding users...')

  const password1 = await bcrypt.hash('password123', 10)
  const password2 = await bcrypt.hash('password456', 10)

  await db.execute({
    sql: `INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)`,
    args: ['alice', password1],
  })

  await db.execute({
    sql: `INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)`,
    args: ['bob', password2],
  })

  // Get alice's id
  const aliceRow = await db.execute({
    sql: `SELECT id FROM users WHERE username = ?`,
    args: ['alice'],
  })
  const aliceId = aliceRow.rows[0].id

  // Get bob's id
  const bobRow = await db.execute({
    sql: `SELECT id FROM users WHERE username = ?`,
    args: ['bob'],
  })
  const bobId = bobRow.rows[0].id

  console.log('Seeding books...')

  const books = [
    { userId: aliceId, title: 'Clean Code', author: 'Robert C. Martin', genre: 'Programming' },
    { userId: aliceId, title: 'The Pragmatic Programmer', author: 'David Thomas', genre: 'Programming' },
    { userId: aliceId, title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', genre: 'Architecture' },
    { userId: bobId, title: "You Don't Know JS", author: 'Kyle Simpson', genre: 'Programming' },
    { userId: bobId, title: 'Atomic Habits', author: 'James Clear', genre: 'Self-Help' },
  ]

  for (const book of books) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO books (user_id, title, author, genre) VALUES (?, ?, ?, ?)`,
      args: [book.userId, book.title, book.author, book.genre],
    })
  }

  console.log('Done! Schema + seed complete.')
  console.log('Test credentials:')
  console.log('  alice / password123')
  console.log('  bob / password456')

  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
