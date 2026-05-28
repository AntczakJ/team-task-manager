import express from 'express'
import type { Request, Response, NextFunction } from 'express'
import cors from 'cors'

import authRoutes from './routes/authRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import taskRoutes from './routes/taskRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)

app.use(
  (err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
      message: err.message || 'Błąd serwera'
    })
  }
)

export default app
