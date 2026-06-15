import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse('Unauthorized', 401);

    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' }
    });

    return successResponse(events);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
      return errorResponse('Unauthorized', 403);
    }

    const body = await req.json();
    const { title, description, date, imageUrl } = body;

    if (!title || !description || !date) {
      return errorResponse('Missing required fields: title, description, date');
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        imageUrl,
        createdById: user.id
      }
    });

    // Notify all users about the event
    const allUsers = await prisma.user.findMany({
      where: { id: { not: user.id } },
      select: { id: true }
    });

    if (allUsers.length > 0) {
      await prisma.notification.createMany({
        data: allUsers.map(u => ({
          userId: u.id,
          title: `Upcoming School Event: ${title}`,
          message: `Join us on ${new Date(date).toLocaleDateString()} for ${title}. Details: ${description.substring(0, 50)}`,
          type: 'EVENT'
        }))
      });
    }

    return successResponse(event, 201);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
