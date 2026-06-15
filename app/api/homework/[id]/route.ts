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
    const { subject, classId, description, dueDate, resourceUrl } = body;

    const homework = await prisma.homework.findUnique({ where: { id } });
    if (!homework) return errorResponse('Homework not found', 404);

    if (homework.createdById !== user.profileId) {
      return errorResponse('Unauthorized to edit this homework', 403);
    }

    const updated = await prisma.homework.update({
      where: { id },
      data: {
        subject,
        classId,
        description,
        dueDate: dueDate ? new Date(dueDate) : homework.dueDate,
        resourceUrl
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
    const homework = await prisma.homework.findUnique({ where: { id } });
    if (!homework) return errorResponse('Homework not found', 404);

    if (homework.createdById !== user.profileId) {
      return errorResponse('Unauthorized to delete this homework', 403);
    }

    await prisma.homework.delete({ where: { id } });
    return successResponse({ message: 'Homework deleted successfully' });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
