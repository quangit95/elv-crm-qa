import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { customerName, customerPhone, leadTitle } = await req.json();
    
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

    return NextResponse.json(lead);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create quick lead' }, { status: 500 });
  }
}
