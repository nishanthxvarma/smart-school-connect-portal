import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
      return errorResponse('Unauthorized', 403);
    }

    const { id } = await params;
    const body = await req.json();
    const { title, content, category, scheduledDate, isPublished } = body;

    const notice = await prisma.notice.findUnique({ where: { id } });
    if (!notice) return errorResponse('Notice not found', 404);

    if (user.role !== 'ADMIN' && notice.createdById !== user.id) {
      return errorResponse('Unauthorized to edit this notice', 403);
    }

    const updated = await prisma.notice.update({
      where: { id },
      data: {
        title,
        content,
        category,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        isPublished,
        publishDate: scheduledDate ? new Date(scheduledDate) : notice.publishDate,
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
    if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
      return errorResponse('Unauthorized', 403);
    }

    const { id } = await params;
    const notice = await prisma.notice.findUnique({ where: { id } });
    if (!notice) return errorResponse('Notice not found', 404);

    if (user.role !== 'ADMIN' && notice.createdById !== user.id) {
      return errorResponse('Unauthorized to delete this notice', 403);
    }

    await prisma.notice.delete({ where: { id } });
    return successResponse({ message: 'Notice deleted successfully' });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
