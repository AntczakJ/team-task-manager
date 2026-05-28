import { jest } from '@jest/globals'

const mockPrisma = {
  project: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  task: { deleteMany: jest.fn() }
}

jest.unstable_mockModule('../src/utils/prismaClient.js', () => ({
  default: mockPrisma
}))

const { createProject, getProjectById, deleteProject } = await import(
  '../src/controllers/projectController.js'
)

const mockRes = () => {
  const res = {}
  res.status = jest.fn(() => res)
  res.json = jest.fn(() => res)
  return res
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('projectController.createProject', () => {
  test('zwraca 400 gdy brak nazwy projektu', async () => {
    const req = { body: {}, user: { id: 1 } }
    const res = mockRes()

    await createProject(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(400)
    expect(mockPrisma.project.create).not.toHaveBeenCalled()
  })

  test('tworzy projekt przypisany do zalogowanego właściciela i zwraca 201', async () => {
    mockPrisma.project.create.mockResolvedValue({ id: 1, name: 'Projekt A', ownerId: 1 })
    const req = { body: { name: 'Projekt A', description: 'opis' }, user: { id: 1 } }
    const res = mockRes()

    await createProject(req, res, jest.fn())

    expect(mockPrisma.project.create).toHaveBeenCalledWith({
      data: { name: 'Projekt A', description: 'opis', ownerId: 1 }
    })
    expect(res.status).toHaveBeenCalledWith(201)
  })
})

describe('projectController.getProjectById', () => {
  test('zwraca 404 gdy projekt nie istnieje', async () => {
    mockPrisma.project.findUnique.mockResolvedValue(null)
    const req = { params: { id: '1' }, user: { id: 1 } }
    const res = mockRes()

    await getProjectById(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(404)
  })

  test('zwraca 403 gdy projekt należy do innego użytkownika', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 2 })
    const req = { params: { id: '1' }, user: { id: 1 } }
    const res = mockRes()

    await getProjectById(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(403)
  })

  test('zwraca 200 gdy właściciel pobiera swój projekt', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 1, tasks: [] })
    const req = { params: { id: '1' }, user: { id: 1 } }
    const res = mockRes()

    await getProjectById(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(200)
  })
})

describe('projectController.deleteProject', () => {
  test('usuwa najpierw zadania, potem projekt i zwraca 200', async () => {
    mockPrisma.project.findUnique.mockResolvedValue({ id: 1, ownerId: 1 })
    mockPrisma.task.deleteMany.mockResolvedValue({ count: 2 })
    mockPrisma.project.delete.mockResolvedValue({ id: 1 })
    const req = { params: { id: '1' }, user: { id: 1 } }
    const res = mockRes()

    await deleteProject(req, res, jest.fn())

    expect(mockPrisma.task.deleteMany).toHaveBeenCalledWith({ where: { projectId: 1 } })
    expect(mockPrisma.project.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
