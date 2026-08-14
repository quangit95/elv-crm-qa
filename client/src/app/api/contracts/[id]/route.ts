import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        lead: {
          include: {
            customer: true
          }
        },
        quotation: true
      }
    });
    if (!contract) return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    return NextResponse.json(contract);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status, startDate, endDate, terms } = await req.json();
    
    const updatedContract = await prisma.contract.update({
      where: { id: params.id },
      data: {
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        terms
      }
    });
    
    return NextResponse.json(updatedContract);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const contract = await prisma.contract.findUnique({ where: { id: params.id } });
    if (contract) {
      await prisma.$transaction(async (tx) => {
        await tx.contract.delete({ where: { id: params.id } });
        await tx.quotation.update({
          where: { id: contract.quotationId },
          data: { status: 'SENT' } // Revert to SENT or similar
        });
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
  }
}
