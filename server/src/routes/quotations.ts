import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { generateQuotationPDF } from '../utils/exportPdf'
import { generateQuotationExcel } from '../utils/exportExcel'

const router = Router()
const prisma = new PrismaClient()

// Get all quotations
router.get('/', async (req, res) => {
  try {
    const { status } = req.query
    const isActive = status === 'inactive' ? false : true
    const quotations = await prisma.quotation.findMany({
      where: { isActive },
      include: {
        lead: {
          include: { customer: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(quotations)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotations' })
  }
})

// Get a single quotation with sections and items
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        lead: { include: { customer: true } },
        sections: {
          include: { items: true },
          orderBy: { order: 'asc' }
        }
      }
    })
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' })
    res.json(quotation)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotation details' })
  }
})

// Create a new quotation
router.post('/', async (req, res) => {
  try {
    const { leadId, sections, discount = 0, tax = 10 } = req.body
    
    // Generate a unique code (e.g. QT-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const code = `QT-${dateStr}-${randomNum}`

    // Calculate totals
    let totalCost = 0
    let totalAmount = 0

    // Create the quotation and its nested relations
    const quotation = await prisma.quotation.create({
      data: {
        code,
        leadId,
        discount,
        tax,
        sections: {
          create: sections.map((sec: any, idx: number) => {
            let sectionTotal = 0
            const items = sec.items.map((item: any) => {
              const itemTotal = item.quantity * item.unitPrice
              sectionTotal += itemTotal
              totalCost += item.quantity * item.costPrice
              totalAmount += itemTotal
              
              return {
                catalogItemId: item.catalogItemId || null,
                name: item.name,
                unit: item.unit,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                costPrice: item.costPrice,
                total: itemTotal
              }
            })

            return {
              name: sec.name,
              order: idx,
              items: { create: items }
            }
          })
        }
      },
      include: { sections: { include: { items: true } } }
    })

    // Update totals
    const grandTotal = totalAmount - discount + (totalAmount - discount) * (tax / 100)
    
    const updatedQuotation = await prisma.quotation.update({
      where: { id: quotation.id },
      data: { totalCost, totalAmount, grandTotal }
    })

    // Also update lead status to QUOTED
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'QUOTED' }
    })

    res.json(updatedQuotation)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create quotation' })
  }
})

// Export to PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        lead: { include: { customer: true } },
        sections: { include: { items: { include: { catalogItem: true } } }, orderBy: { order: 'asc' } }
      }
    })
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' })
    
    const company = await prisma.company.findFirst()
    generateQuotationPDF(quotation, company, res)
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF' })
  }
})

// Export to Excel
router.get('/:id/excel', async (req, res) => {
  try {
    const { id } = req.params
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        lead: { include: { customer: true } },
        sections: { include: { items: { include: { catalogItem: true } } }, orderBy: { order: 'asc' } }
      }
    })
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' })
    
    const company = await prisma.company.findFirst()
    await generateQuotationExcel(quotation, company, res)
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate Excel' })
  }
})

// Update an existing quotation
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { leadId, sections, discount = 0, tax = 10 } = req.body

    // Calculate totals
    let totalCost = 0
    let totalAmount = 0

    // Delete existing sections to recreate them (safest way to handle nested deep updates)
    await prisma.quotationSection.deleteMany({
      where: { quotationId: id }
    })

    const quotation = await prisma.quotation.update({
      where: { id },
      data: {
        leadId,
        discount,
        tax,
        sections: {
          create: sections.map((sec: any, idx: number) => {
            let sectionTotal = 0
            const items = sec.items.map((item: any) => {
              const itemTotal = item.quantity * item.unitPrice
              sectionTotal += itemTotal
              totalCost += item.quantity * item.costPrice
              totalAmount += itemTotal
              
              return {
                catalogItemId: item.catalogItemId || null,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                costPrice: item.costPrice,
                total: itemTotal
              }
            })

            return {
              name: sec.name,
              order: idx,
              items: { create: items }
            }
          })
        }
      }
    })

    // Update totals
    const grandTotal = totalAmount - discount + (totalAmount - discount) * (tax / 100)
    
    const updatedQuotation = await prisma.quotation.update({
      where: { id },
      data: { totalCost, totalAmount, grandTotal },
      include: { sections: { include: { items: true } } }
    })

    res.json(updatedQuotation)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update quotation' })
  }
})

// Archive a quotation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.quotation.update({
      where: { id },
      data: { isActive: false }
    })
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to archive quotation' })
  }
})

// Restore a quotation
router.patch('/:id/restore', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.quotation.update({
      where: { id },
      data: { isActive: true }
    })
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to restore quotation' })
  }
})

// Update status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const quotation = await prisma.quotation.update({
      where: { id },
      data: { status }
    })
    res.json(quotation)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update status' })
  }
})

export default router
