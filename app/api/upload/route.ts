import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse('Unauthorized', 401);

    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return errorResponse('No file uploaded', 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create safe filename
    const originalName = (file as any).name || 'upload.bin';
    const extension = path.extname(originalName);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${extension}`;
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'homework');
    
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Write file
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/homework/${filename}`;
    return successResponse({ fileUrl });
  } catch (err: any) {
    return errorResponse(err.message, 550);
  }
}
