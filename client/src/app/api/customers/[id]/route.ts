import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const data = await req.json();
    const item = await prisma.customer.update({
      where: { id: resolvedParams.id },
      data
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await prisma.customer.update({
      where: { id: resolvedParams.id },
      data: { isActive: false }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to archive customer' }, { status: 500 });
  }
}
