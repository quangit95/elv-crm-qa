import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(companies);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, phone, email, address, taxCode, logo, representative } = await req.json();
    
    // Check if any company exists. If not, make this one active by default.
    const count = await prisma.company.count();
    const isActive = count === 0;

    const company = await prisma.company.create({
      data: { name, phone, email, address, taxCode, logo, representative, isActive }
    });
    return NextResponse.json(company);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
