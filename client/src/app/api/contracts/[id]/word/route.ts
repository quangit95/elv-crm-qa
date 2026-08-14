import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateContractWord } from '@/lib/utils/exportContractWord';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
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
    const company = await prisma.company.findFirst();
    return await generateContractWord(contract, company);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate Word document' }, { status: 500 });
  }
}
