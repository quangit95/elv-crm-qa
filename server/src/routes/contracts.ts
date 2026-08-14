import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Get all contracts
router.get('/', async (req, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        lead: {
          include: {
            customer: true
          }
        },
        quotation: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(contracts)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch contracts' })
  }
})

// Get a single contract
router.get('/:id', async (req, res) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: req.params.id },
      include: {
        lead: {
          include: {
            customer: true
          }
        },
        quotation: true
      }
    })
    if (!contract) return res.status(404).json({ error: 'Contract not found' })
    res.json(contract)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch contract' })
  }
})

import { generateContractPDF } from '../utils/exportContractPdf'
import { generateContractWord } from '../utils/exportContractWord'

// Get PDF for a single contract
router.get('/:id/pdf', async (req, res) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: req.params.id },
      include: {
        lead: { include: { customer: true } },
        quotation: {
          include: {
            sections: { include: { items: { include: { catalogItem: true } } }, orderBy: { order: 'asc' } }
          }
        }
      }
    })
    
    if (!contract) return res.status(404).json({ error: 'Contract not found' })
    const company = await prisma.company.findFirst()
    generateContractPDF(contract, company, res)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to generate PDF' })
  }
})

// Get Word for a single contract
router.get('/:id/word', async (req, res) => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: req.params.id },
      include: {
        lead: { include: { customer: true } },
        quotation: {
          include: {
            sections: { include: { items: { include: { catalogItem: true } } }, orderBy: { order: 'asc' } }
          }
        }
      }
    })
    
    if (!contract) return res.status(404).json({ error: 'Contract not found' })
    const company = await prisma.company.findFirst()
    await generateContractWord(contract, company, res)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to generate Word document' })
  }
})

// Create a new contract
router.post('/', async (req, res) => {
  try {
    const { code, quotationId, startDate, endDate, terms } = req.body
    
    // Validate quotation
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId }
    })

    if (!quotation) {
      return res.status(400).json({ error: 'Quotation not found' })
    }

    // Check if contract already exists for this quotation
    const existingContract = await prisma.contract.findUnique({
      where: { quotationId }
    })

    if (existingContract) {
      return res.status(400).json({ error: 'Contract already exists for this quotation' })
    }

    // Create contract and update quotation status
    const contract = await prisma.$transaction(async (tx) => {
      const newContract = await tx.contract.create({
        data: {
          code,
          quotationId,
          leadId: quotation.leadId,
          totalValue: quotation.grandTotal, // Pull value from quotation
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          terms,
          status: 'DRAFT'
        }
      })

      // Auto update quotation status to ACCEPTED
      await tx.quotation.update({
        where: { id: quotationId },
        data: { status: 'ACCEPTED' }
      })

      return newContract
    })

    res.status(201).json(contract)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create contract' })
  }
})

// Update contract
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status, startDate, endDate, terms } = req.body
    
    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        terms
      }
    })
    
    res.json(updatedContract)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update contract' })
  }
})

// Delete contract
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // We should probably revert Quotation status if we delete the contract
    const contract = await prisma.contract.findUnique({ where: { id } })
    if (contract) {
      await prisma.$transaction(async (tx) => {
        await tx.contract.delete({ where: { id } })
        await tx.quotation.update({
          where: { id: contract.quotationId },
          data: { status: 'SENT' } // Revert to SENT or similar
        })
      })
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to delete contract' })
  }
})

export default router
