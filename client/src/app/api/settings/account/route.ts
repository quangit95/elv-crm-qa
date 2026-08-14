import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Admin',
          password: 'password123'
        }
      });
    }
    return NextResponse.json({ email: user.email });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { email, currentPassword, newPassword } = await req.json();
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 });
    }

    if (currentPassword !== user.password) {
      return NextResponse.json({ error: 'Mật khẩu hiện tại không đúng' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        password: newPassword || user.password
      }
    });

    return NextResponse.json({ email: updatedUser.email, message: 'Cập nhật thành công' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
