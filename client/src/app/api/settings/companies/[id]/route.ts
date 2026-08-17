import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { name, phone, email, address, taxCode, logo, representative } = await req.json();
    const company = await prisma.company.update({
      where: { id: resolvedParams.id },
      data: { name, phone, email, address, taxCode, logo, representative }
    });
    return NextResponse.json(company);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    
    // Check if it's the active company
    const company = await prisma.company.findUnique({ where: { id: resolvedParams.id } });
    if (company?.isActive) {
       // Cannot delete active company if it's the only one
       const count = await prisma.company.count();
       if (count > 1) {
         return NextResponse.json({ error: 'Cannot delete the active company. Please activate another one first.' }, { status: 400 });
       }
    }

    await prisma.company.delete({
      where: { id: resolvedParams.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
