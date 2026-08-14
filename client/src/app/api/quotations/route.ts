import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const isActive = status === 'inactive' ? false : true;

    const quotations = await prisma.quotation.findMany({
      where: { isActive },
      include: {
        lead: {
          include: { customer: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(quotations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { leadId, sections, discount = 0, tax = 10 } = await req.json();
    
    // Generate a unique code (e.g. QT-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const code = `QT-${dateStr}-${randomNum}`;

    let totalCost = 0;
    let totalAmount = 0;

    const quotation = await prisma.quotation.create({
      data: {
        code,
        leadId,
        discount,
        tax,
        sections: {
          create: sections.map((sec: any, idx: number) => {
            let sectionTotal = 0;
            const items = sec.items.map((item: any) => {
              const itemTotal = item.quantity * item.unitPrice;
              sectionTotal += itemTotal;
              totalCost += item.quantity * item.costPrice;
              totalAmount += itemTotal;
              
              return {
                catalogItemId: item.catalogItemId || null,
                name: item.name,
                unit: item.unit,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                costPrice: item.costPrice,
                total: itemTotal
              };
            });

            return {
              name: sec.name,
              order: idx,
              items: { create: items }
            };
          })
        }
      },
      include: { sections: { include: { items: true } } }
    });

    const grandTotal = totalAmount - discount + (totalAmount - discount) * (tax / 100);
    
    const updatedQuotation = await prisma.quotation.update({
      where: { id: quotation.id },
      data: { totalCost, totalAmount, grandTotal }
    });

    await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'QUOTED' }
    });

    return NextResponse.json(updatedQuotation);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create quotation' }, { status: 500 });
  }
}
