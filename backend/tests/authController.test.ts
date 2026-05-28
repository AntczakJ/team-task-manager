import { jest } from '@jest/globals'
import bcrypt from 'bcryptjs'

process.env.JWT_SECRET = 'test-secret'

const mockPrisma = {
  user: { findUnique: jest.fn(), create: jest.fn() }
}

jest.unstable_mockModule('../src/utils/prismaClient.js', () => ({
  default: mockPrisma
}))

const { register, login } = await import('../src/controllers/authController.js')

const mockRes = () => {
  const res = {}
  res.status = jest.fn(() => res)
  res.json = jest.fn(() => res)
  return res
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('authController.register', () => {
  test('zwraca 400 gdy brakuje wymaganych pól', async () => {
    const req = { body: { email: 'jan@example.com' } }
    const res = mockRes()

    await register(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(400)
    expect(mockPrisma.user.findUnique).not.toHaveBeenCalled()
  })

  test('zwraca 409 gdy użytkownik z danym emailem już istnieje', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'jan@example.com' })
    const req = { body: { name: 'Jan', email: 'jan@example.com', password: 'tajne' } }
    const res = mockRes()

    await register(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(409)
    expect(mockPrisma.user.create).not.toHaveBeenCalled()
  })

  test('zwraca 201, token oraz dane użytkownika bez hasła przy poprawnej rejestracji', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({
      id: 7,
      name: 'Jan',
      email: 'jan@example.com',
      password: 'zahaszowane'
    })
    const req = { body: { name: 'Jan', email: 'jan@example.com', password: 'tajne' } }
    const res = mockRes()

    await register(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(201)
    const payload = res.json.mock.calls[0][0]
    expect(payload).toHaveProperty('token')
    expect(payload.user).toMatchObject({ id: 7, name: 'Jan', email: 'jan@example.com' })
    expect(payload.user).not.toHaveProperty('password')
  })
})

describe('authController.login', () => {
  test('zwraca 400 gdy brakuje emaila lub hasła', async () => {
    const req = { body: {} }
    const res = mockRes()

    await login(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(400)
  })

  test('zwraca 401 gdy użytkownik nie istnieje', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    const req = { body: { email: 'jan@example.com', password: 'tajne' } }
    const res = mockRes()

    await login(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(401)
  })

  test('zwraca 401 gdy hasło jest nieprawidłowe', async () => {
    const hash = bcrypt.hashSync('poprawne-haslo', 10)
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'Jan',
      email: 'jan@example.com',
      password: hash
    })
    const req = { body: { email: 'jan@example.com', password: 'zle-haslo' } }
    const res = mockRes()

    await login(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(401)
  })

  test('zwraca 200 i token przy poprawnym logowaniu', async () => {
    const hash = bcrypt.hashSync('poprawne-haslo', 10)
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: 'Jan',
      email: 'jan@example.com',
      password: hash
    })
    const req = { body: { email: 'jan@example.com', password: 'poprawne-haslo' } }
    const res = mockRes()

    await login(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(200)
    const payload = res.json.mock.calls[0][0]
    expect(payload).toHaveProperty('token')
    expect(payload.user).toMatchObject({ id: 1, email: 'jan@example.com' })
  })
})
