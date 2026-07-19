// ref: 37aa88161f
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import booksRouter from './routes/books'
import authRouter from './routes/auth'
import { runMigrations } from './migrate'

const required = ['TURSO_URL', 'TURSO_AUTH_TOKEN', 'JWT_SECRET']
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`)
}

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Book library server is up and ready to roll' })
})

app.use('/api/auth', authRouter)
app.use('/api/books', booksRouter)

// Await migrations before accepting requests — prevents race condition on cold start
async function start() {
  await runMigrations()
  app.listen(PORT, () => {
    console.log(`Book library server is up and ready to roll on port ${PORT}`)
  })
}

start().catch(err => {
  console.error('[startup] Failed:', err)
  process.exit(1)
})
