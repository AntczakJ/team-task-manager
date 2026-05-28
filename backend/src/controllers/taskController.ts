import type { RequestHandler } from 'express'
import prisma from '../utils/prismaClient.js'

export const getTasksByProject: RequestHandler = async (req, res, next) => {
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

export const getTaskById: RequestHandler = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
      include: { assignee: { select: { id: true, name: true, email: true } } }
    })

    if (!task) {
      res.status(404).json({ message: 'Zadanie nie istnieje' })
      return
    }

    res.status(200).json(task)
  } catch (err) {
    next(err)
  }
}

export const createTask: RequestHandler = async (req, res, next) => {
  try {
    const { title, description, projectId, assigneeId } = req.body

    if (!title || !projectId) {
      res.status(400).json({ message: 'Tytuł i projekt są wymagane' })
      return
    }

    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) }
    })

    if (!project) {
      res.status(404).json({ message: 'Projekt nie istnieje' })
      return
    }

    if (project.ownerId !== req.user!.id) {
      res.status(403).json({ message: 'Brak dostępu do tego projektu' })
      return
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

export const updateTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
      include: { project: true }
    })

    if (!task) {
      res.status(404).json({ message: 'Zadanie nie istnieje' })
      return
    }

    if (task.project.ownerId !== req.user!.id) {
      res.status(403).json({ message: 'Brak dostępu do tego zadania' })
      return
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

export const deleteTask: RequestHandler = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
      include: { project: true }
    })

    if (!task) {
      res.status(404).json({ message: 'Zadanie nie istnieje' })
      return
    }

    if (task.project.ownerId !== req.user!.id) {
      res.status(403).json({ message: 'Brak dostępu do tego zadania' })
      return
    }

    await prisma.task.delete({
      where: { id: Number(req.params.id) }
    })

    res.status(200).json({ message: 'Zadanie usunięte' })
  } catch (err) {
    next(err)
  }
}

export const updateTaskStatus: RequestHandler = async (req, res, next) => {
  try {
    const { status } = req.body
    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE']

    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: 'Nieprawidłowy status' })
      return
    }

    const task = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
      include: { project: true }
    })

    if (!task) {
      res.status(404).json({ message: 'Zadanie nie istnieje' })
      return
    }

    if (task.project.ownerId !== req.user!.id) {
      res.status(403).json({ message: 'Brak dostępu do tego zadania' })
      return
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
