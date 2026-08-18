import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateContractPDF } from '@/lib/utils/exportContractPdf';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = await params;
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        lead: { include: { customer: true } },
        quotation: {
          include: {
            sections: { include: { items: { include: { catalogItem: true } } }, orderBy: { order: 'asc' } }
          }
        }
      }
    });
    
    if (!contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    let company = await prisma.company.findFirst({ where: { isActive: true } });
    if (!company) company = await prisma.company.findFirst();
    return await generateContractPDF(contract, company);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
