import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import path from 'path'

dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ELV CRM API is running' })
})

import catalogRoutes from './routes/catalog'
import customerRoutes from './routes/customers'
import leadRoutes from './routes/leads'
import quotationRoutes from './routes/quotations'
import projectRoutes from './routes/projects'
import contractRoutes from './routes/contracts'
import dashboardRoutes from './routes/dashboard'
import categoriesRoutes from './routes/categories'
import brandsRoutes from './routes/brands'
import suppliersRoutes from './routes/suppliers'
import settingsRoutes from './routes/settings'

app.use('/api/catalog', catalogRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/quotations', quotationRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/contracts', contractRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/brands', brandsRoutes)
app.use('/api/suppliers', suppliersRoutes)
app.use('/api/settings', settingsRoutes)


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
