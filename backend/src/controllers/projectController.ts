import type { RequestHandler } from 'express'
import prisma from '../utils/prismaClient.js'

export const getAllProjects: RequestHandler = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { ownerId: req.user!.id },
      include: { tasks: true }
    })
    res.status(200).json(projects)
  } catch (err) {
    next(err)
  }
}

export const getProjectById: RequestHandler = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(req.params.id) },
      include: { tasks: true }
    })

    if (!project) {
      res.status(404).json({ message: 'Projekt nie istnieje' })
      return
    }

    if (project.ownerId !== req.user!.id) {
      res.status(403).json({ message: 'Brak dostępu do tego projektu' })
      return
    }

    res.status(200).json(project)
  } catch (err) {
    next(err)
  }
}

export const createProject: RequestHandler = async (req, res, next) => {
  try {
    const { name, description } = req.body

    if (!name) {
      res.status(400).json({ message: 'Nazwa projektu jest wymagana' })
      return
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user!.id
      }
    })

    res.status(201).json(project)
  } catch (err) {
    next(err)
  }
}

export const updateProject: RequestHandler = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(req.params.id) }
    })

    if (!project) {
      res.status(404).json({ message: 'Projekt nie istnieje' })
      return
    }

    if (project.ownerId !== req.user!.id) {
      res.status(403).json({ message: 'Brak dostępu do tego projektu' })
      return
    }

    const updated = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data: req.body
    })

    res.status(200).json(updated)
  } catch (err) {
    next(err)
  }
}

export const deleteProject: RequestHandler = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(req.params.id) }
    })

    if (!project) {
      res.status(404).json({ message: 'Projekt nie istnieje' })
      return
    }

    if (project.ownerId !== req.user!.id) {
      res.status(403).json({ message: 'Brak dostępu do tego projektu' })
      return
    }

    await prisma.task.deleteMany({
      where: { projectId: Number(req.params.id) }
    })

    await prisma.project.delete({
      where: { id: Number(req.params.id) }
    })

    res.status(200).json({ message: 'Projekt usunięty' })
  } catch (err) {
    next(err)
  }
}
