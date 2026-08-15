import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { status } = await req.json();
    const item = await prisma.lead.update({
      where: { id: resolvedParams.id },
      data: { status }
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update lead status' }, { status: 500 });
  }
}
