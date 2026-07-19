import { Router } from 'express'
import { BookController } from '../controllers/BookController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// Export MUST be before /:id to avoid route conflict
router.get('/export', authMiddleware, BookController.export)

// GET — no auth (exam spec)
router.get('/', BookController.list)

// POST + DELETE + PATCH — auth required
router.post('/', authMiddleware, BookController.create)
router.delete('/:id', authMiddleware, BookController.delete)
router.patch('/:id/status', authMiddleware, BookController.updateStatus)
router.patch('/:id/favorite', authMiddleware, BookController.toggleFavorite)

export default router
