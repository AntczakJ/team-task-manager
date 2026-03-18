import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../utils/prismaClient.js'

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Wszystkie pola są wymagane' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res
        .status(409)
        .json({ message: 'Użytkownik z tym emailem już istnieje' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    })

    const token = generateToken(user)

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email i hasło są wymagane' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' })
    }

    const token = generateToken(user)

    res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (err) {
    next(err)
  }
}
