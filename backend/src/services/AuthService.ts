import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db'

export class AuthService {
  async login(username: string, password: string) {
    if (!username || !password) {
      throw new Error('username and password are required')
    }

    // Inline user query — no separate UserRepository needed
    const result = await db.execute({
      sql: 'SELECT id, username, password_hash FROM users WHERE username = ?',
      args: [username],
    })

    const user = result.rows[0]
    if (!user) throw new Error('Invalid credentials')

    const valid = await bcrypt.compare(password, user.password_hash as string)
    if (!valid) throw new Error('Invalid credentials')

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    return { token, username: user.username }
  }
}
