import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return errorResponse('Unauthorized', 403);
    }

    const { id } = await params;
    const body = await req.json();
    const { name, teacherId } = body;

    const existingClass = await prisma.class.findUnique({ where: { id } });
    if (!existingClass) return errorResponse('Class not found', 404);

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name: name || undefined,
        teacherId: teacherId === '' ? null : (teacherId || undefined)
      }
    });

    return successResponse(updatedClass);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return errorResponse('Unauthorized', 403);
    }

    const { id } = await params;

    const existingClass = await prisma.class.findUnique({ where: { id } });
    if (!existingClass) return errorResponse('Class not found', 404);

    await prisma.class.delete({ where: { id } });
    return successResponse({ message: 'Class deleted successfully' });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
