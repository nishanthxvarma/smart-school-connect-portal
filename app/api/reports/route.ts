import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
      return errorResponse('Unauthorized', 403);
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // attendance, performance, feedback, issues
    const classId = searchParams.get('classId');

    if (!type) {
      return errorResponse('Missing query parameter: type');
    }

    if (type === 'attendance') {
      const filter: any = {};
      if (classId) {
        const students = await prisma.student.findMany({
          where: { classId },
          select: { id: true }
        });
        filter.studentId = { in: students.map(s => s.id) };
      }

      const data = await prisma.attendance.findMany({
        where: filter,
        include: {
          student: {
            include: {
              user: { select: { name: true } },
              class: { select: { name: true } }
            }
          },
          markedBy: { include: { user: { select: { name: true } } } }
        },
        orderBy: { date: 'desc' }
      });

      const formatted = data.map(record => ({
        Date: record.date.toISOString().split('T')[0],
        Student: record.student.user.name,
        Class: record.student.class.name,
        RollNumber: record.student.rollNumber,
        Status: record.status,
        Remarks: record.remarks || '-',
        MarkedBy: record.markedBy.user.name
      }));

      return successResponse(formatted);
    }

    if (type === 'performance') {
      const filter: any = {};
      if (classId) {
        const students = await prisma.student.findMany({
          where: { classId },
          select: { id: true }
        });
        filter.studentId = { in: students.map(s => s.id) };
      }

      const data = await prisma.mark.findMany({
        where: filter,
        include: {
          student: {
            include: {
              user: { select: { name: true } },
              class: { select: { name: true } }
            }
          },
          gradedBy: { include: { user: { select: { name: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const formatted = data.map(record => ({
        Student: record.student.user.name,
        Class: record.student.class.name,
        RollNumber: record.student.rollNumber,
        Subject: record.subject,
        ExamName: record.examName,
        Score: record.score,
        MaxScore: record.maxScore,
        Remarks: record.remarks || '-',
        GradedBy: record.gradedBy.user.name
      }));

      return successResponse(formatted);
    }

    if (type === 'feedback') {
      const data = await prisma.appointment.findMany({
        include: {
          parent: { include: { user: { select: { name: true } } } },
          teacher: { include: { user: { select: { name: true } } } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const formatted = data.map(record => ({
        RequestDate: record.createdAt.toISOString().split('T')[0],
        ParentName: record.parent.user.name,
        TeacherName: record.teacher.user.name,
        Purpose: record.purpose,
        PreferredDate: record.preferredDate.toISOString().split('T')[0],
        Status: record.status,
        Remarks: record.remarks || '-'
      }));

      return successResponse(formatted);
    }

    if (type === 'issues') {
      const data = await prisma.complaint.findMany({
        include: {
          reporter: { select: { name: true, role: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      const formatted = data.map(record => ({
        ReportedDate: record.date.toISOString().split('T')[0],
        Title: record.title,
        Category: record.category.replace(/_/g, ' '),
        Status: record.status,
        Reporter: record.reporter.name,
        Role: record.reporter.role,
        Description: record.description
      }));

      return successResponse(formatted);
    }

    return errorResponse('Invalid report type', 400);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
