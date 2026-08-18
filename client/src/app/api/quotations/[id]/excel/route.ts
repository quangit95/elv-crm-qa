import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQuotationExcel } from '@/lib/utils/exportExcel';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const quotation = await prisma.quotation.findUnique({
      where: { id: resolvedParams.id },
      include: {
        lead: { include: { customer: true } },
        sections: { include: { items: { include: { catalogItem: true } } }, orderBy: { order: 'asc' } }
      }
    });
    if (!quotation) return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    
    let company = await prisma.company.findFirst({ where: { isActive: true } });
    if (!company) company = await prisma.company.findFirst();
    return await generateQuotationExcel(quotation, company);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate Excel' }, { status: 500 });
  }
}
