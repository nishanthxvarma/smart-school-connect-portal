import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    const subject = searchParams.get('subject');

    const filter: any = {};

    if (user.role === 'STUDENT') {
      filter.classId = user.classId;
    } else if (user.role === 'PARENT') {
      const studentId = searchParams.get('studentId');
      const parentProfile = await prisma.parent.findUnique({
        where: { userId: user.id },
        include: { students: true }
      });
      if (!parentProfile) return errorResponse('Parent profile not found', 404);
      const childIds = parentProfile.students.map(s => s.id);
      
      if (studentId && childIds.includes(studentId)) {
        const studentObj = parentProfile.students.find(s => s.id === studentId);
        filter.classId = studentObj?.classId;
      } else {
        const childClassIds = parentProfile.students.map(s => s.classId);
        filter.classId = { in: childClassIds };
      }
    } else if (user.role === 'TEACHER') {
      if (classId) {
        filter.classId = classId;
      } else {
        // By default show homework created by this teacher
        filter.createdById = user.profileId;
      }
    }

    if (subject) {
      filter.subject = { contains: subject, mode: 'insensitive' };
    }

    const homeworks = await prisma.homework.findMany({
      where: filter,
      include: {
        class: { select: { name: true } },
        createdBy: { include: { user: { select: { name: true } } } }
      },
      orderBy: { dueDate: 'asc' }
    });

    return successResponse(homeworks);
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
    const { subject, classId, description, dueDate, resourceUrl } = body;

    if (!subject || !classId || !description || !dueDate) {
      return errorResponse('Missing required fields: subject, classId, description, dueDate');
    }

    const homework = await prisma.homework.create({
      data: {
        subject,
        classId,
        description,
        dueDate: new Date(dueDate),
        resourceUrl,
        createdById: user.profileId
      }
    });

    // Create notifications for all students in the class
    const studentsInClass = await prisma.student.findMany({
      where: { classId },
      select: { userId: true }
    });

    if (studentsInClass.length > 0) {
      await prisma.notification.createMany({
        data: studentsInClass.map(s => ({
          userId: s.userId,
          title: `New Homework: ${subject}`,
          message: `Homework due on ${new Date(dueDate).toLocaleDateString()}: ${description.substring(0, 50)}`,
          type: 'HOMEWORK'
        }))
      });
    }

    return successResponse(homework, 201);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
