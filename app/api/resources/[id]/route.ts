import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'TEACHER') {
      return errorResponse('Unauthorized', 403);
    }

    const { id } = await params;
    const body = await req.json();
    const { title, category, fileUrl, classId, subject } = body;

    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) return errorResponse('Resource not found', 404);

    if (resource.uploadedById !== user.profileId) {
      return errorResponse('Unauthorized to modify this resource', 403);
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: {
        title,
        category,
        fileUrl,
        classId,
        subject
      }
    });

    return successResponse(updated);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'TEACHER') {
      return errorResponse('Unauthorized', 403);
    }

    const { id } = await params;
    const resource = await prisma.resource.findUnique({ where: { id } });
    if (!resource) return errorResponse('Resource not found', 404);

    if (resource.uploadedById !== user.profileId) {
      return errorResponse('Unauthorized to delete this resource', 403);
    }

    await prisma.resource.delete({ where: { id } });
    return successResponse({ message: 'Resource deleted successfully' });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
