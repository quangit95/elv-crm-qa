import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('logo') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.name);
    const filename = `logo-${uniqueSuffix}${ext}`;
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Ignore
    }
    
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    
    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 });
  }
}
