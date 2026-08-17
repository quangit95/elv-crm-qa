import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const quotation = await prisma.quotation.findUnique({
      where: { id: resolvedParams.id },
      include: {
        lead: { include: { customer: true } },
        sections: {
          include: { items: { include: { catalogItem: true } } },
          orderBy: { order: 'asc' }
        }
      }
    });
    if (!quotation) return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    return NextResponse.json(quotation);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quotation details' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { leadId, sections, discount = 0, tax = 10 } = await req.json();

    let totalCost = 0;
    let totalAmount = 0;

    await prisma.quotationSection.deleteMany({
      where: { quotationId: resolvedParams.id }
    });

    const quotation = await prisma.quotation.update({
      where: { id: resolvedParams.id },
      data: {
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
      }
    });

    const grandTotal = totalAmount - discount + (totalAmount - discount) * (tax / 100);
    
    const updatedQuotation = await prisma.quotation.update({
      where: { id: resolvedParams.id },
      data: { totalCost, totalAmount, grandTotal },
      include: { sections: { include: { items: true } } }
    });

    return NextResponse.json(updatedQuotation);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update quotation' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await prisma.quotation.update({
      where: { id: resolvedParams.id },
      data: { isActive: false }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to archive quotation' }, { status: 500 });
  }
}
