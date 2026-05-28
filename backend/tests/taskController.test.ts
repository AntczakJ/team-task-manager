import { jest } from '@jest/globals'

const mockPrisma = {
  task: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  project: { findUnique: jest.fn() }
}

jest.unstable_mockModule('../src/utils/prismaClient.js', () => ({
  default: mockPrisma
}))

const { createTask, updateTaskStatus } = await import('../src/controllers/taskController.js')

const mockRes = () => {
  const res = {}
  res.status = jest.fn(() => res)
  res.json = jest.fn(() => res)
  return res
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('taskController.createTask', () => {
  test('zwraca 400 gdy brak tytułu lub projektu', async () => {
    const req = { body: { title: 'Zadanie' }, user: { id: 1 } }
    const res = mockRes()

    await createTask(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(400)
    expect(mockPrisma.task.create).not.toHaveBeenCalled()
  })

  test('zwraca 404 gdy projekt nie istnieje', async () => {
    mockPrisma.project.findUnique.mockResolvedValue(null)
    const req = { body: { title: 'Zadanie', projectId: 1 }, user: { id: 1 } }
    const res = mockRes()

    await createTask(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(404)
  })

  test('zwraca 403 gdy projekt należy do innego użytkownika', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 2 })
    const req = { body: { title: 'Zadanie', projectId: 1 }, user: { id: 1 } }
    const res = mockRes()

    await createTask(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(403)
    expect(mockPrisma.task.create).not.toHaveBeenCalled()
  })

  test('tworzy zadanie i zwraca 201 gdy właściciel projektu jest poprawny', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 1 })
    mockPrisma.task.create.mockResolvedValue({ id: 5, title: 'Zadanie', projectId: 1 })
    const req = { body: { title: 'Zadanie', projectId: 1 }, user: { id: 1 } }
    const res = mockRes()

    await createTask(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(201)
  })
})

describe('taskController.updateTaskStatus', () => {
  test('zwraca 400 dla nieprawidłowego statusu', async () => {
    const req = { params: { id: '1' }, body: { status: 'NIEISTNIEJACY' }, user: { id: 1 } }
    const res = mockRes()

    await updateTaskStatus(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(400)
    expect(mockPrisma.task.findUnique).not.toHaveBeenCalled()
  })

  test('zwraca 404 gdy zadanie nie istnieje', async () => {
    mockPrisma.task.findUnique.mockResolvedValue(null)
    const req = { params: { id: '1' }, body: { status: 'DONE' }, user: { id: 1 } }
    const res = mockRes()

    await updateTaskStatus(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(404)
  })

  test('zwraca 403 gdy zadanie należy do projektu innego użytkownika', async () => {
    mockPrisma.task.findUnique.mockResolvedValue({ id: 1, project: { ownerId: 2 } })
    const req = { params: { id: '1' }, body: { status: 'DONE' }, user: { id: 1 } }
    const res = mockRes()

    await updateTaskStatus(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(403)
  })

  test('aktualizuje status i zwraca 200 dla właściciela', async () => {
    mockPrisma.task.findUnique.mockResolvedValue({ id: 1, project: { ownerId: 1 } })
    mockPrisma.task.update.mockResolvedValue({ id: 1, status: 'DONE' })
    const req = { params: { id: '1' }, body: { status: 'DONE' }, user: { id: 1 } }
    const res = mockRes()

    await updateTaskStatus(req, res, jest.fn())

    expect(mockPrisma.task.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: 'DONE' }
    })
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
