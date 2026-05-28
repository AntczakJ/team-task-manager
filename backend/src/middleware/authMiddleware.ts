import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Brak tokena autoryzacyjnego' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number
      email: string
    }
    next()
  } catch {
    res.status(401).json({ message: 'Token nieważny lub wygasły' })
  }
}

export default authMiddleware
