import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const { role, profileId, classId } = user;

    if (role === 'ADMIN') {
      // 1. Total Students
      const totalStudents = await prisma.student.count();
      // 2. Total Teachers
      const totalTeachers = await prisma.teacher.count();
      // 3. Total Parents
      const totalParents = await prisma.parent.count();

      // 4. Overall Attendance Percentage
      const allAttendance = await prisma.attendance.findMany({
        select: { status: true }
      });
      const totalAttendanceCount = allAttendance.length;
      const presentCount = allAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      const attendancePercentage = totalAttendanceCount > 0 
        ? Math.round((presentCount / totalAttendanceCount) * 100) 
        : 100;

      // 5. Upcoming Events (next 3)
      const upcomingEvents = await prisma.event.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 3
      });

      // 6. Pending Complaints Count
      const pendingComplaints = await prisma.complaint.count({
        where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS'] } }
      });

      // 7. Charts Data: Complaint Categories
      const complaints = await prisma.complaint.findMany({
        select: { category: true }
      });
      const complaintCategoriesObj = complaints.reduce((acc: any, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
      }, {});
      const complaintCategoriesChart = Object.keys(complaintCategoriesObj).map(key => ({
        name: key.replace(/_/g, ' '),
        value: complaintCategoriesObj[key]
      }));

      // 8. Charts Data: Attendance Trends (past 5 records groups)
      const attendanceByDate = await prisma.attendance.findMany({
        orderBy: { date: 'asc' },
        select: { date: true, status: true }
      });
      const attendanceTrendsObj = attendanceByDate.reduce((acc: any, item) => {
        const dateStr = item.date.toISOString().split('T')[0];
        if (!acc[dateStr]) {
          acc[dateStr] = { present: 0, total: 0 };
        }
        acc[dateStr].total += 1;
        if (item.status === 'PRESENT' || item.status === 'LATE') {
          acc[dateStr].present += 1;
        }
        return acc;
      }, {});
      const attendanceTrendsChart = Object.keys(attendanceTrendsObj).map(date => ({
        date,
        percentage: Math.round((attendanceTrendsObj[date].present / attendanceTrendsObj[date].total) * 100)
      })).slice(-5); // Get last 5 days

      // 9. Parent Engagement Statistics (Appointments vs Complaints)
      const totalAppointments = await prisma.appointment.count();
      const totalComplaints = await prisma.complaint.count();
      const parentEngagementChart = [
        { name: 'Appointments Scheduled', count: totalAppointments },
        { name: 'Infrastructure Reports', count: totalComplaints }
      ];

      return successResponse({
        role,
        summary: {
          totalStudents,
          totalTeachers,
          totalParents,
          attendancePercentage,
          upcomingEventsCount: upcomingEvents.length,
          pendingComplaints,
        },
        upcomingEvents,
        charts: {
          complaintCategoriesChart,
          attendanceTrendsChart,
          parentEngagementChart
        }
      });
    }

    if (role === 'TEACHER') {
      if (!profileId) {
        return errorResponse('Teacher profile not found', 404);
      }

      // 1. Classes assigned to teacher
      const classes = await prisma.class.findMany({
        where: { teacherId: profileId },
        select: { id: true, name: true }
      });
      const classIds = classes.map(c => c.id);

      // 2. Total Students in assigned classes
      const studentCount = await prisma.student.count({
        where: { classId: { in: classIds } }
      });

      // 3. Active homework count (due in future)
      const activeHomeworkCount = await prisma.homework.count({
        where: { 
          classId: { in: classIds },
          dueDate: { gte: new Date() }
        }
      });

      // 4. Notices count
      const noticesCount = await prisma.notice.count({
        where: { createdById: user.id }
      });

      // 5. Unapproved Appointments (Pending)
      const pendingAppointments = await prisma.appointment.findMany({
        where: { 
          teacherId: profileId,
          status: 'PENDING'
        },
        include: {
          parent: {
            include: { user: { select: { name: true } } }
          }
        },
        orderBy: { preferredDate: 'asc' }
      });

      return successResponse({
        role,
        summary: {
          assignedClassesCount: classes.length,
          studentCount,
          activeHomeworkCount,
          noticesCount,
          pendingAppointmentsCount: pendingAppointments.length,
        },
        classes,
        pendingAppointments
      });
    }

    if (role === 'PARENT') {
      if (!profileId) {
        return errorResponse('Parent profile not found', 404);
      }

      // 1. Get Parent's children
      const children = await prisma.student.findMany({
        where: { parentId: profileId },
        include: {
          user: { select: { name: true } },
          class: { select: { name: true } }
        }
      });

      const childrenStats = [];

      for (const child of children) {
        // Attendance stats
        const attRecords = await prisma.attendance.findMany({
          where: { studentId: child.id }
        });
        const total = attRecords.length;
        const present = attRecords.filter(r => r.status === 'PRESENT').length;
        const late = attRecords.filter(r => r.status === 'LATE').length;
        const absent = attRecords.filter(r => r.status === 'ABSENT').length;
        
        const attendancePercentage = total > 0 
          ? Math.round(((present + late) / total) * 100) 
          : 100;

        // Pending homeworks
        const homeworks = await prisma.homework.findMany({
          where: { 
            classId: child.classId,
            dueDate: { gte: new Date() }
          },
          orderBy: { dueDate: 'asc' }
        });

        // Academic performance
        const marks = await prisma.mark.findMany({
          where: { studentId: child.id },
          orderBy: { createdAt: 'desc' },
          take: 5
        });

        childrenStats.push({
          studentId: child.id,
          name: child.user.name,
          rollNumber: child.rollNumber,
          className: child.class.name,
          attendance: {
            total,
            present,
            late,
            absent,
            percentage: attendancePercentage
          },
          homeworks,
          marks
        });
      }

      // 2. Parent's Appointments
      const parentAppointments = await prisma.appointment.findMany({
        where: { parentId: profileId },
        include: {
          teacher: {
            include: { user: { select: { name: true } } }
          }
        },
        orderBy: { preferredDate: 'desc' }
      });

      return successResponse({
        role,
        children: childrenStats,
        appointments: parentAppointments
      });
    }

    if (role === 'STUDENT') {
      if (!profileId || !classId) {
        return errorResponse('Student profile not found', 404);
      }

      // 1. Attendance percentage
      const attRecords = await prisma.attendance.findMany({
        where: { studentId: profileId }
      });
      const total = attRecords.length;
      const present = attRecords.filter(r => r.status === 'PRESENT').length;
      const late = attRecords.filter(r => r.status === 'LATE').length;
      const absent = attRecords.filter(r => r.status === 'ABSENT').length;
      const attendancePercentage = total > 0 
        ? Math.round(((present + late) / total) * 100) 
        : 100;

      // 2. Pending Homework
      const pendingHomeworks = await prisma.homework.findMany({
        where: { 
          classId,
          dueDate: { gte: new Date() }
        },
        orderBy: { dueDate: 'asc' }
      });

      // 3. Academic marks
      const academicMarks = await prisma.mark.findMany({
        where: { studentId: profileId },
        orderBy: { createdAt: 'desc' }
      });

      // 4. Achievements
      const achievements = await prisma.achievement.findMany({
        where: { studentId: profileId },
        orderBy: { dateAwarded: 'desc' }
      });

      return successResponse({
        role,
        attendance: {
          present,
          late,
          absent,
          total,
          percentage: attendancePercentage
        },
        homeworks: pendingHomeworks,
        marks: academicMarks,
        achievements
      });
    }

    return errorResponse('Invalid role', 400);
  } catch (err: any) {
    console.error('Stats fetch error:', err);
    return errorResponse(err.message, 500);
  }
}
