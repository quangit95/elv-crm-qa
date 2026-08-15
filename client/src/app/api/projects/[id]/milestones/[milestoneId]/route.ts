import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string, milestoneId: string }> }) {
  try {
    const resolvedParams = await params;
    const { status } = await req.json();
    const milestone = await prisma.projectMilestone.update({
      where: { id: resolvedParams.milestoneId },
      data: { status }
    });
    return NextResponse.json(milestone);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 });
  }
}
