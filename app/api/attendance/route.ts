import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');
    const date = searchParams.get('date');

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
      } else if (classId) {
        // Find students in class
        const students = await prisma.student.findMany({
          where: { classId },
          select: { id: true }
        });
        const studentIds = students.map(s => s.id);
        filter.studentId = { in: studentIds };
      }
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      filter.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    const attendance = await prisma.attendance.findMany({
      where: filter,
      include: {
        student: { include: { user: { select: { name: true } } } },
        markedBy: { include: { user: { select: { name: true } } } }
      },
      orderBy: { date: 'desc' }
    });

    return successResponse(attendance);
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
    const { date, records } = body; // records: [{ studentId, status, remarks }]

    if (!date || !records || !Array.isArray(records)) {
      return errorResponse('Missing required fields: date, records (array)');
    }

    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    const results = [];

    for (const record of records) {
      const { studentId, status, remarks } = record;

      // Find if attendance record already exists for this student on this day
      const existing = await prisma.attendance.findFirst({
        where: {
          studentId,
          date: {
            gte: attendanceDate,
            lte: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000 - 1)
          }
        }
      });

      let savedRecord;

      if (existing) {
        savedRecord = await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            status,
            remarks,
            markedById: user.profileId
          }
        });
      } else {
        savedRecord = await prisma.attendance.create({
          data: {
            studentId,
            date: attendanceDate,
            status,
            remarks,
            markedById: user.profileId
          }
        });
      }

      // If absent, notify the parent of the student
      if (status === 'ABSENT') {
        const studentInfo = await prisma.student.findUnique({
          where: { id: studentId },
          include: { parent: true, user: { select: { name: true } } }
        });

        if (studentInfo?.parent?.userId) {
          await prisma.notification.create({
            data: {
              userId: studentInfo.parent.userId,
              title: `Attendance Alert: Absent`,
              message: `Your child ${studentInfo.user.name} has been marked ABSENT on ${attendanceDate.toLocaleDateString()}.`,
              type: 'ATTENDANCE'
            }
          });
        }
      }

      results.push(savedRecord);
    }

    return successResponse({ message: 'Attendance marked successfully', count: results.length });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
