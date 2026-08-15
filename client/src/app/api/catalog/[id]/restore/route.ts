import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await prisma.catalogItem.update({
      where: { id: resolvedParams.id },
      data: { isActive: true }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to restore catalog item' }, { status: 500 });
  }
}
