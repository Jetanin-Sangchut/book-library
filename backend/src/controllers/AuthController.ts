// ref: 37aa88161f
import { Request, Response } from 'express'
import { AuthService } from '../services/AuthService'

const service = new AuthService()

export const AuthController = {
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body
      const result = await service.login(username, password)
      res.json({ type: 'Auth', token: result.token, username: result.username })
    } catch (err: any) {
      res.status(401).json({
        error: 'Access denied: session credential missing or expired',
      })
    }
  },
}
