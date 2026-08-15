import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const data = await req.json();
    const resolvedParams = await params;
    const item = await prisma.catalogItem.update({
      where: { id: resolvedParams.id },
      data
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update catalog item' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const url = new URL(req.url);
    const isHardDelete = url.searchParams.get('hard') === 'true';

    if (isHardDelete) {
      await prisma.catalogItem.delete({
        where: { id: resolvedParams.id }
      });
    } else {
      await prisma.catalogItem.update({
        where: { id: resolvedParams.id },
        data: { isActive: false }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process delete request' }, { status: 500 });
  }
}
