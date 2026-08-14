import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        customer: true,
        manager: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// Get a single project
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        customer: true,
        manager: true,
        milestones: { orderBy: { order: 'asc' } },
        payments: { orderBy: { createdAt: 'asc' } }
      }
    })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json(project)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project details' })
  }
})

// Create a new project
router.post('/', async (req, res) => {
  try {
    const { name, customerId, managerId, startDate, endDate, milestones } = req.body
    const project = await prisma.project.create({
      data: {
        name,
        customerId,
        managerId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        milestones: milestones ? {
          create: milestones.map((m: any, idx: number) => ({
            name: m.name,
            order: idx
          }))
        } : undefined
      },
      include: { milestones: true }
    })
    res.json(project)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' })
  }
})

// Update milestone status
router.patch('/:id/milestones/:milestoneId', async (req, res) => {
  try {
    const { milestoneId } = req.params
    const { status } = req.body
    const milestone = await prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: { status }
    })
    res.json(milestone)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update milestone' })
  }
})

export default router
