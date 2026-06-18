import { NextRequest } from 'next/server';
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
    const base64String = buffer.toString('base64');
    const mimeType = file.type || 'application/octet-stream';
    const fileUrl = `data:${mimeType};base64,${base64String}`;

    return successResponse({ fileUrl });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
