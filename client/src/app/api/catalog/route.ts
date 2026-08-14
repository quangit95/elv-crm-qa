import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const isActive = status === 'inactive' ? false : true;

    const items = await prisma.catalogItem.findMany({
      where: { isActive },
      include: {
        category: true,
        brand: true,
        supplier: true
      }
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch catalog items' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const item = await prisma.catalogItem.create({ data });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create catalog item' }, { status: 500 });
  }
}
