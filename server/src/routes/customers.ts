import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  try {
    const { status } = req.query
    const isActive = status === 'inactive' ? false : true
    const items = await prisma.customer.findMany({
      where: { isActive }
    })
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' })
  }
})

router.post('/', async (req, res) => {
  try {
    const data = req.body
    const item = await prisma.customer.create({ data })
    res.json(item)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create customer' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body
    const item = await prisma.customer.update({
      where: { id },
      data
    })
    res.json(item)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' })
  }
})

export default router

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.customer.update({
      where: { id },
      data: { isActive: false }
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to archive customer' })
  }
})

router.patch('/:id/restore', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.customer.update({
      where: { id },
      data: { isActive: true }
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore customer' })
  }
})
