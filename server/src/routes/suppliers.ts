import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(suppliers)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers' })
  }
})

// Create a supplier
router.post('/', async (req, res) => {
  try {
    const data = req.body
    const supplier = await prisma.supplier.create({ data })
    res.json(supplier)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create supplier' })
  }
})

// Update a supplier
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body
    const supplier = await prisma.supplier.update({
      where: { id },
      data
    })
    res.json(supplier)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update supplier' })
  }
})

// Delete a supplier
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.supplier.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete supplier' })
  }
})

export default router
