import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import ExcelJS from 'exceljs'
import path from 'path'

const router = Router()
const prisma = new PrismaClient()

// Storage for images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'catalog-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const uploadDisk = multer({ storage });

// Storage for Excel memory
const upload = multer({ storage: multer.memoryStorage() })

// Get all catalog items
router.get('/', async (req, res) => {
  try {
    const { status } = req.query
    const isActive = status === 'inactive' ? false : true
    const items = await prisma.catalogItem.findMany({
      where: { isActive },
      include: {
        category: true,
        brand: true,
        supplier: true
      }
    })
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch catalog items' })
  }
})

// Download Excel Template
router.get('/template', async (req, res) => {
  res.status(501).json({ error: 'Not implemented for new schema' })
})

// Import from Excel
router.post('/import', upload.single('file'), async (req, res) => {
  res.status(501).json({ error: 'Not implemented for new schema' })
})

// Upload Image
router.post('/upload-image', uploadDisk.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
})

// Create a catalog item
router.post('/', async (req, res) => {
  try {
    const data = req.body
    const item = await prisma.catalogItem.create({ data })
    res.json(item)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create catalog item' })
  }
})

// Update a catalog item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const data = req.body
    const item = await prisma.catalogItem.update({
      where: { id },
      data
    })
    res.json(item)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update catalog item' })
  }
})

// Archive a catalog item (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.catalogItem.update({
      where: { id },
      data: { isActive: false }
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to archive catalog item' })
  }
})

// Restore a catalog item
router.patch('/:id/restore', async (req, res) => {
  try {
    const { id } = req.params
    await prisma.catalogItem.update({
      where: { id },
      data: { isActive: true }
    })
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore catalog item' })
  }
})

export default router
