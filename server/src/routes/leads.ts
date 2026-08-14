import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  try {
    const items = await prisma.lead.findMany({
      include: {
        customer: true,
        assignee: true
      }
    })
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads' })
  }
})

router.post('/quick', async (req, res) => {
  try {
    const { customerName, customerPhone, leadTitle } = req.body;
    
    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name: customerName || 'Khách hàng mới',
        phone: customerPhone || '',
        type: "B2B"
      }
    });

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        title: leadTitle || 'Dự án mới',
        customerId: customer.id,
        status: "NEW"
      },
      include: { customer: true }
    });

    res.json(lead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create quick lead' });
  }
});


router.post('/', async (req, res) => {
  try {
    const data = req.body
    const item = await prisma.lead.create({ data })
    res.json(item)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lead' })
  }
})

// Update lead status (for Kanban drag & drop)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const item = await prisma.lead.update({
      where: { id },
      data: { status }
    })
    res.json(item)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead status' })
  }
})

export default router
