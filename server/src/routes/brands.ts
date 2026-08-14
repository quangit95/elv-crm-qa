import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Get all brands
router.get('/', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(brands)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brands' })
  }
})

// Create a brand
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body
    const brand = await prisma.brand.create({
      data: { name, description }
    })
    res.json(brand)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create brand' })
  }
})

// Update a brand
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description } = req.body
    const brand = await prisma.brand.update({
      where: { id },
      data: { name, description }
    })
    res.json(brand)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update brand' })
  }
})

// Delete a brand
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.brand.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete brand' })
  }
})

export default router
