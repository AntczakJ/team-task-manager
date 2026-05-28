import { jest } from '@jest/globals'
import jwt from 'jsonwebtoken'
import authMiddleware from '../src/middleware/authMiddleware.js'

const SECRET = 'test-secret'
process.env.JWT_SECRET = SECRET

const mockRes = () => {
  const res = {}
  res.status = jest.fn(() => res)
  res.json = jest.fn(() => res)
  return res
}

describe('authMiddleware', () => {
  test('zwraca 401 gdy brak nagłówka Authorization', () => {
    const req = { headers: {} }
    const res = mockRes()
    const next = jest.fn()

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('zwraca 401 gdy nagłówek nie zaczyna się od "Bearer "', () => {
    const req = { headers: { authorization: 'Token abc' } }
    const res = mockRes()
    const next = jest.fn()

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('zwraca 401 gdy token jest nieprawidłowy', () => {
    const req = { headers: { authorization: 'Bearer niepoprawny.token' } }
    const res = mockRes()
    const next = jest.fn()

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('ustawia req.user i wywołuje next() dla poprawnego tokena', () => {
    const token = jwt.sign({ id: 1, email: 'jan@example.com' }, SECRET)
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = mockRes()
    const next = jest.fn()

    authMiddleware(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toMatchObject({ id: 1, email: 'jan@example.com' })
    expect(res.status).not.toHaveBeenCalled()
  })
})
