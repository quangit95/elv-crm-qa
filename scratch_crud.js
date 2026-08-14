const fs = require('fs');
const path = require('path');

const models = ['brand', 'category', 'supplier'];

models.forEach(model => {
  const modelName = model.charAt(0).toUpperCase() + model.slice(1);
  const plural = model === 'category' ? 'categories' : model + 's';
  const dir = path.join(__dirname, `client/src/app/api/${plural}`);
  const idDir = path.join(dir, '[id]');
  
  fs.mkdirSync(idDir, { recursive: true });

  const routeContent = `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const data = await prisma.${model}.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await prisma.${model}.create({
      data: body
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
`;

  const idRouteContent = `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = await prisma.${model}.update({
      where: { id: params.id },
      data: body
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.${model}.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
`;

  fs.writeFileSync(path.join(dir, 'route.ts'), routeContent);
  fs.writeFileSync(path.join(idDir, 'route.ts'), idRouteContent);
  console.log(`Generated API for ${plural}`);
});
