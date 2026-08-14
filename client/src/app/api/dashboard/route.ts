import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalLeads = await prisma.lead.count();
    const newCustomers = await prisma.customer.count(); // Assuming all are "new" for now
    
    // Quotes stats
    const quotations = await prisma.quotation.findMany({
      include: {
        lead: { include: { customer: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    const pendingQuotationsCount = quotations.filter(q => q.status !== 'APPROVED').length;
    const pendingQuotationsValue = quotations.filter(q => q.status !== 'APPROVED').reduce((sum, q) => sum + q.grandTotal, 0);

    const recentQuotations = quotations.slice(0, 5);

    // Projects stats
    const projects = await prisma.project.findMany({
      include: {
        customer: true
      }
    });
    const completedProjectsCount = projects.filter(p => p.status === 'COMPLETED').length;
    const activeProjects = projects.filter(p => p.status !== 'COMPLETED').slice(0, 5);

    return NextResponse.json({
      totalLeads,
      newCustomers,
      pendingQuotations: {
        count: pendingQuotationsCount,
        value: pendingQuotationsValue
      },
      completedProjectsCount,
      recentQuotations,
      activeProjects
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
