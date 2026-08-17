import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Database...')

  // 1. Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@elvcrm.vn' },
    update: {},
    create: {
      email: 'admin@elvcrm.vn',
      password: 'password123', // In real app, must be hashed
      name: 'Admin System',
      role: 'ADMIN',
    },
  })

  const sales = await prisma.user.upsert({
    where: { email: 'sales@elvcrm.vn' },
    update: {},
    create: {
      email: 'sales@elvcrm.vn',
      password: 'password123',
      name: 'Nguyen Van Sales',
      role: 'SALES',
    },
  })

  // 2. Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Công ty TNHH XYZ (Nhà Xưởng)',
      phone: '0901234567',
      email: 'contact@xyz.com',
      address: 'KCN VSIP, Bình Dương',
      type: 'B2B'
    }
  })

  // 3. Leads
  const lead1 = await prisma.lead.create({
    data: {
      title: 'Hệ thống Camera & Mạng xưởng mới',
      status: 'SURVEYED',
      customerId: customer1.id,
      assigneeId: sales.id,
      notes: 'Khách hàng cần 32 camera và hệ thống Wi-Fi mesh cho xưởng 2000m2'
    }
  })

  // 4. Catalog Items (Vật tư Điện nhẹ)
  const catalog = [
    {
      category: 'Camera',
      brand: 'Hikvision',
      model: 'DS-2CD2043G2-I',
      name: 'Camera IP thân trụ 4MP',
      costPrice: 950000,
      sellingPrice: 1450000,
      unit: 'Cái',
      warranty: 24
    },
    {
      category: 'Camera',
      brand: 'Hikvision',
      model: 'DS-7608NI-K1',
      name: 'Đầu ghi hình IP 8 kênh',
      costPrice: 1800000,
      sellingPrice: 2600000,
      unit: 'Cái',
      warranty: 24
    },
    {
      category: 'Networking',
      brand: 'Ruijie',
      model: 'RG-RAP2200(E)',
      name: 'Bộ phát Wi-Fi ốp trần Reyee',
      costPrice: 1400000,
      sellingPrice: 2100000,
      unit: 'Cái',
      warranty: 36
    },
    {
      category: 'Networking',
      brand: 'MikroTik',
      model: 'RB750Gr3',
      name: 'Router cân bằng tải MikroTik',
      costPrice: 1250000,
      sellingPrice: 1850000,
      unit: 'Cái',
      warranty: 12
    },
    {
      category: 'Cable',
      brand: 'Dintek',
      model: 'CAT6-UTP',
      name: 'Cáp mạng CAT6 Dintek cuộn 305m',
      costPrice: 1650000,
      sellingPrice: 2200000,
      unit: 'Cuộn',
      warranty: 12
    },
    {
      category: 'Labor',
      brand: null,
      model: null,
      name: 'Nhân công thi công cáp & Lắp đặt',
      costPrice: 250000,
      sellingPrice: 400000,
      unit: 'Điểm',
      warranty: 0
    }
  ]

  for (const item of catalog) {
    await prisma.catalogItem.create({
      data: item as any
    })
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
