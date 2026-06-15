import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse('Unauthorized', 401);

    const filter: any = {};

    if (user.role === 'PARENT') {
      filter.parentId = user.profileId;
    } else if (user.role === 'TEACHER') {
      filter.teacherId = user.profileId;
    }

    const appointments = await prisma.appointment.findMany({
      where: filter,
      include: {
        parent: { include: { user: { select: { name: true, email: true } } } },
        teacher: { include: { user: { select: { name: true, email: true } } } }
      },
      orderBy: { preferredDate: 'asc' }
    });

    return successResponse(appointments);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'PARENT') {
      return errorResponse('Unauthorized', 403);
    }

    const body = await req.json();
    const { teacherId, purpose, preferredDate } = body;

    if (!teacherId || !purpose || !preferredDate) {
      return errorResponse('Missing required fields: teacherId, purpose, preferredDate');
    }

    const appointment = await prisma.appointment.create({
      data: {
        teacherId,
        purpose,
        preferredDate: new Date(preferredDate),
        parentId: user.profileId,
        status: 'PENDING'
      }
    });

    // Notify the Teacher
    const teacherProfile = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { userId: true }
    });

    if (teacherProfile) {
      await prisma.notification.create({
        data: {
          userId: teacherProfile.userId,
          title: 'New Meeting Request',
          message: `A parent has requested a meeting on ${new Date(preferredDate).toLocaleDateString()}: "${purpose.substring(0, 50)}"`,
          type: 'APPOINTMENT'
        }
      });
    }

    return successResponse(appointment, 201);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
