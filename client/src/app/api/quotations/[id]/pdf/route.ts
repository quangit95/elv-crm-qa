import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateQuotationPDF } from '@/lib/utils/exportPdf';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = await params;
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        lead: { include: { customer: true } },
        sections: { include: { items: { include: { catalogItem: true } } }, orderBy: { order: 'asc' } }
      }
    });
    if (!quotation) return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    
    const company = await prisma.company.findFirst();
    return await generateQuotationPDF(quotation, company);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
