import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        customer: true,
        manager: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, customerId, managerId, startDate, endDate, milestones } = await req.json();
    const project = await prisma.project.create({
      data: {
        name,
        customerId,
        managerId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        milestones: milestones ? {
          create: milestones.map((m: any, idx: number) => ({
            name: m.name,
            order: idx
          }))
        } : undefined
      },
      include: { milestones: true }
    });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
