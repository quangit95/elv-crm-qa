import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { customerId, customerName, customerPhone, leadTitle } = await req.json();
    
    let custId = customerId;
    
    if (!custId) {
      let existingCust = null;
      if (customerName) {
        existingCust = await prisma.customer.findFirst({
          where: { name: customerName }
        });
      }
      
      if (existingCust) {
        custId = existingCust.id;
      } else {
        const customer = await prisma.customer.create({
          data: {
            name: customerName || 'Khách hàng mới',
            phone: customerPhone || '',
            type: "B2B"
          }
        });
        custId = customer.id;
      }
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        title: leadTitle || 'Dự án mới',
        customerId: custId,
        status: "NEW"
      },
      include: { customer: true }
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create quick lead' }, { status: 500 });
  }
}
