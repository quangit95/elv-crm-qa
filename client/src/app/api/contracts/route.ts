import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        lead: {
          include: {
            customer: true
          }
        },
        quotation: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(contracts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { code, quotationId, startDate, endDate, terms } = await req.json();
    
    // Validate quotation
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId }
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 400 });
    }

    // Check if contract already exists for this quotation
    const existingContract = await prisma.contract.findUnique({
      where: { quotationId }
    });

    if (existingContract) {
      return NextResponse.json({ error: 'Contract already exists for this quotation' }, { status: 400 });
    }

    // Create contract and update quotation status
    const contract = await prisma.$transaction(async (tx) => {
      const newContract = await tx.contract.create({
        data: {
          code,
          quotationId,
          leadId: quotation.leadId,
          totalValue: quotation.grandTotal, // Pull value from quotation
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          terms,
          status: 'DRAFT'
        }
      });

      // Auto update quotation status to ACCEPTED
      await tx.quotation.update({
        where: { id: quotationId },
        data: { status: 'ACCEPTED' }
      });

      return newContract;
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
  }
}
