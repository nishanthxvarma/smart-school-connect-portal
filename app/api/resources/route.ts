import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const category = searchParams.get('category');
    const subject = searchParams.get('subject');

    const filter: any = {};

    if (user.role === 'STUDENT') {
      filter.classId = user.classId;
    } else if (user.role === 'PARENT') {
      const parentProfile = await prisma.parent.findUnique({
        where: { userId: user.id },
        include: { students: true }
      });
      if (!parentProfile) return errorResponse('Parent profile not found', 404);
      const childClassIds = parentProfile.students.map(s => s.classId);
      filter.classId = { in: childClassIds };
    } else if (user.role === 'TEACHER') {
      if (classId) {
        filter.classId = classId;
      } else {
        filter.uploadedById = user.profileId;
      }
    }

    if (category) {
      filter.category = category;
    }

    if (subject) {
      filter.subject = { contains: subject, mode: 'insensitive' };
    }

    const resources = await prisma.resource.findMany({
      where: filter,
      include: {
        class: { select: { name: true } },
        uploadedBy: { include: { user: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(resources);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'TEACHER') {
      return errorResponse('Unauthorized', 403);
    }

    const body = await req.json();
    const { title, category, fileUrl, classId, subject } = body;

    if (!title || !category || !classId || !subject) {
      return errorResponse('Missing required fields: title, category, classId, subject');
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        category,
        fileUrl,
        classId,
        subject,
        uploadedById: user.profileId
      }
    });

    return successResponse(resource, 201);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
