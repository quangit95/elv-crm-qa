import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// Create a category
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body
    const category = await prisma.category.create({
      data: { name, description }
    })
    res.json(category)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' })
  }
})

// Update a category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description } = req.body
    const category = await prisma.category.update({
      where: { id },
      data: { name, description }
    })
    res.json(category)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' })
  }
})

// Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.category.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

export default router
