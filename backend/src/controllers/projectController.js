import prisma from '../utils/prismaClient.js'

export const getAllProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { ownerId: req.user.id },
      include: { tasks: true }
    })
    res.status(200).json(projects)
  } catch (err) {
    next(err)
  }
}

export const getProjectById = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(req.params.id) },
      include: { tasks: true }
    })

    if (!project) {
      return res.status(404).json({ message: 'Projekt nie istnieje' })
    }

    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Brak dostępu do tego projektu' })
    }

    res.status(200).json(project)
  } catch (err) {
    next(err)
  }
}

export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Nazwa projektu jest wymagana' })
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.id
      }
    })

    res.status(201).json(project)
  } catch (err) {
    next(err)
  }
}

export const updateProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(req.params.id) }
    })

    if (!project) {
      return res.status(404).json({ message: 'Projekt nie istnieje' })
    }

    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Brak dostępu do tego projektu' })
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

export const deleteProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: Number(req.params.id) }
    })

    if (!project) {
      return res.status(404).json({ message: 'Projekt nie istnieje' })
    }

    if (project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Brak dostępu do tego projektu' })
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
