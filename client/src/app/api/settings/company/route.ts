import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Công ty của bạn',
        }
      });
    }
    return NextResponse.json(company);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { name, phone, email, address, taxCode, logo } = await req.json();
    let company = await prisma.company.findFirst();
    if (company) {
      company = await prisma.company.update({
        where: { id: company.id },
        data: { name, phone, email, address, taxCode, logo }
      });
    } else {
      company = await prisma.company.create({
        data: { name, phone, email, address, taxCode, logo }
      });
    }
    return NextResponse.json(company);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
