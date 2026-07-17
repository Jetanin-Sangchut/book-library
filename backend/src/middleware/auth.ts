import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthUser {
  id: number
  username: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      error: 'Access denied: session credential missing or expired',
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({
      error: 'Access denied: session credential missing or expired',
    })
  }
}
