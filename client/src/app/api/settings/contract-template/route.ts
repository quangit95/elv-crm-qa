import { NextResponse } from 'next/server';
import path from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';

export async function GET() {
  try {
    // contract_template.txt is at the root folder
    const templatePath = path.join(process.cwd(), 'contract_template.txt');
    if (!existsSync(templatePath)) {
      return NextResponse.json({ content: '' });
    }
    const content = readFileSync(templatePath, 'utf8');
    return NextResponse.json({ content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to read contract template' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { content } = await req.json();
    const templatePath = path.join(process.cwd(), 'contract_template.txt');
    writeFileSync(templatePath, content, 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to write contract template' }, { status: 500 });
  }
}
