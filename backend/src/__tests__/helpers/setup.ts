import 'dotenv/config'
import supertest from 'supertest'
import express from 'express'
import cors from 'cors'
import bookRoutes from '../../routes/books'
import authRoutes from '../../routes/auth'

// Build app inline — mirrors index.ts setup (without migration runner)
export const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)

// Shared auth state — populated in beforeAll
export const auth = { token: '' }

export const agent = supertest(app)
