import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const project = await prisma.project.findUnique({
      where: { id: resolvedParams.id },
      include: {
        customer: true,
        manager: true,
        milestones: { orderBy: { order: 'asc' } },
        payments: { orderBy: { createdAt: 'asc' } }
      }
    });
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch project details' }, { status: 500 });
  }
}
