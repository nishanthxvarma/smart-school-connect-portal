import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse('Unauthorized', 401);

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit to last 20
    });

    return successResponse(notifications);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse('Unauthorized', 401);

    const body = await req.json();
    const { id, readAll } = body;

    if (readAll) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true }
      });
      return successResponse({ message: 'All notifications marked as read' });
    }

    if (!id) {
      return errorResponse('Missing notification ID');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    return successResponse(updated);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
