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
    
    // Ràng buộc: Nếu vật tư đã có trong hệ thống (cùng tên), chỉ cập nhật lại giá và danh mục
    const existingItem = await prisma.catalogItem.findFirst({
      where: { name: data.name }
    });

    if (existingItem) {
      const updated = await prisma.catalogItem.update({
        where: { id: existingItem.id },
        data: {
          costPrice: data.costPrice !== undefined ? data.costPrice : existingItem.costPrice,
          sellingPrice: data.sellingPrice !== undefined ? data.sellingPrice : existingItem.sellingPrice,
          unit: data.unit || existingItem.unit,
          categoryId: data.categoryId || existingItem.categoryId,
          model: data.model || existingItem.model,
        }
      });
      return NextResponse.json({ ...updated, _isUpdated: true });
    }

    const item = await prisma.catalogItem.create({ data });
    return NextResponse.json({ ...item, _isUpdated: false });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create catalog item' }, { status: 500 });
  }
}
