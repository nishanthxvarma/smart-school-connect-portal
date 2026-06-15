import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const subject = searchParams.get('subject');

    const filter: any = {};

    if (user.role === 'STUDENT') {
      filter.studentId = user.profileId;
    } else if (user.role === 'PARENT') {
      const parentProfile = await prisma.parent.findUnique({
        where: { userId: user.id },
        include: { students: true }
      });
      if (!parentProfile) return errorResponse('Parent profile not found', 404);
      const childIds = parentProfile.students.map(s => s.id);
      
      if (studentId && childIds.includes(studentId)) {
        filter.studentId = studentId;
      } else {
        filter.studentId = { in: childIds };
      }
    } else if (user.role === 'TEACHER') {
      if (studentId) {
        filter.studentId = studentId;
      } else {
        filter.gradedById = user.profileId;
      }
    }

    if (subject) {
      filter.subject = subject;
    }

    const marks = await prisma.mark.findMany({
      where: filter,
      include: {
        student: { include: { user: { select: { name: true } } } },
        gradedBy: { include: { user: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(marks);
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
    const { studentId, subject, examName, score, maxScore, remarks } = body;

    if (!studentId || !subject || !examName || score === undefined) {
      return errorResponse('Missing required fields: studentId, subject, examName, score');
    }

    const mark = await prisma.mark.create({
      data: {
        studentId,
        subject,
        examName,
        score: parseFloat(score),
        maxScore: maxScore ? parseFloat(maxScore) : 100,
        remarks,
        gradedById: user.profileId
      }
    });

    // Notify the Student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { userId: true, parentId: true }
    });

    if (student) {
      // Notify Student
      await prisma.notification.create({
        data: {
          userId: student.userId,
          title: `New Marks Graded: ${subject}`,
          message: `Your score for ${examName} in ${subject} is ${score}/${maxScore || 100}.`,
          type: 'ATTENDANCE' // Use standard notification type
        }
      });

      // Notify Parent if linked
      if (student.parentId) {
        const parent = await prisma.parent.findUnique({
          where: { id: student.parentId },
          select: { userId: true }
        });
        if (parent) {
          await prisma.notification.create({
            data: {
              userId: parent.userId,
              title: `New Academic Marks for Child`,
              message: `Your child has received ${score}/${maxScore || 100} in ${subject} (${examName}).`,
              type: 'ATTENDANCE'
            }
          });
        }
      }
    }

    return successResponse(mark, 201);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
