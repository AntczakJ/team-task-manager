import prisma from '../utils/prismaClient.js'

export const getTasksByProject = async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: Number(req.params.projectId) },
      include: { assignee: { select: { id: true, name: true, email: true } } }
    })
    res.status(200).json(tasks)
  } catch (err) {
    next(err)
  }
}

export const getTaskById = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
      include: { assignee: { select: { id: true, name: true, email: true } } }
    })

    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie istnieje' })
    }

    res.status(200).json(task)
  } catch (err) {
    next(err)
  }
}

export const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assigneeId } = req.body

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Tytuł i projekt są wymagane' })
    }

    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) }
    })

    if (!project) {
      return res.status(404).json({ message: 'Projekt nie istnieje' })
    }

    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Brak dostępu do tego projektu' })
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId: Number(projectId),
        assigneeId: assigneeId ? Number(assigneeId) : null
      }
    })

    res.status(201).json(task)
  } catch (err) {
    next(err)
  }
}

export const updateTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
      include: { project: true }
    })

    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie istnieje' })
    }

    if (task.project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Brak dostępu do tego zadania' })
    }

    const updated = await prisma.task.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })

    res.status(200).json(updated)
  } catch (err) {
    next(err)
  }
}

export const deleteTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
      include: { project: true }
    })

    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie istnieje' })
    }

    if (task.project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Brak dostępu do tego zadania' })
    }

    await prisma.task.delete({
      where: { id: Number(req.params.id) }
    })

    res.status(200).json({ message: 'Zadanie usunięte' })
  } catch (err) {
    next(err)
  }
}

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Nieprawidłowy status' })
    }

    const task = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
      include: { project: true }
    })

    if (!task) {
      return res.status(404).json({ message: 'Zadanie nie istnieje' })
    }

    if (task.project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Brak dostępu do tego zadania' })
    }

    const updated = await prisma.task.update({
      where: { id: Number(req.params.id) },
      data: { status }
    })

    res.status(200).json(updated)
  } catch (err) {
    next(err)
  }
}
