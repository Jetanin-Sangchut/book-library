import { Router } from 'express'
import { BookController } from '../controllers/BookController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// GET - no auth (exam spec)
router.get('/', BookController.list)

// POST + DELETE - auth required (exam spec)
router.post('/', authMiddleware, BookController.create)
router.delete('/:id', authMiddleware, BookController.delete)

export default router
