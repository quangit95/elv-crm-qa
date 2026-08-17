import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    
    // Deactivate all companies
    await prisma.company.updateMany({
      data: { isActive: false }
    });

    // Activate the selected company
    const company = await prisma.company.update({
      where: { id: resolvedParams.id },
      data: { isActive: true }
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
