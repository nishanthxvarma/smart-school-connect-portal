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
    const { title, description, date, imageUrl } = body;

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return errorResponse('Event not found', 404);

    const updated = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        date: date ? new Date(date) : event.date,
        imageUrl
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
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return errorResponse('Event not found', 404);

    await prisma.event.delete({ where: { id } });
    return successResponse({ message: 'Event deleted successfully' });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
