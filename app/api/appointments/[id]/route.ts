import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const body = await req.json();
    const { purpose, preferredDate, status, rescheduleDate, remarks } = body;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { parent: true }
    });
    if (!appointment) return errorResponse('Appointment not found', 404);

    let updated;

    if (user.role === 'TEACHER') {
      if (appointment.teacherId !== user.profileId) {
        return errorResponse('Unauthorized to modify this appointment', 403);
      }

      updated = await prisma.appointment.update({
        where: { id },
        data: {
          status: status || appointment.status,
          rescheduleDate: rescheduleDate ? new Date(rescheduleDate) : appointment.rescheduleDate,
          remarks: remarks !== undefined ? remarks : appointment.remarks
        }
      });

      // Send status change notification to parent
      if (status && status !== appointment.status) {
        let msg = `Your meeting request is now "${status}".`;
        if (status === 'RESCHEDULED' && rescheduleDate) {
          msg = `Meeting request rescheduled to ${new Date(rescheduleDate).toLocaleDateString()} at request of teacher.`;
        }
        if (remarks) {
          msg += ` Remarks: ${remarks}`;
        }

        await prisma.notification.create({
          data: {
            userId: appointment.parent.userId,
            title: `PTM Meeting Status Update: ${status}`,
            message: msg,
            type: 'APPOINTMENT'
          }
        });
      }
    } else if (user.role === 'PARENT') {
      if (appointment.parentId !== user.profileId) {
        return errorResponse('Unauthorized to modify this appointment', 403);
      }
      if (appointment.status !== 'PENDING') {
        return errorResponse('Cannot edit an appointment that has already been reviewed by the teacher', 400);
      }

      updated = await prisma.appointment.update({
        where: { id },
        data: {
          purpose: purpose || appointment.purpose,
          preferredDate: preferredDate ? new Date(preferredDate) : appointment.preferredDate
        }
      });
    } else {
      return errorResponse('Unauthorized', 403);
    }

    return successResponse(updated);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) return errorResponse('Appointment not found', 404);

    if (user.role !== 'ADMIN') {
      if (appointment.parentId !== user.profileId) {
        return errorResponse('Unauthorized to delete this appointment', 403);
      }
      if (appointment.status !== 'PENDING') {
        return errorResponse('Cannot delete a processed appointment', 400);
      }
    }

    await prisma.appointment.delete({ where: { id } });
    return successResponse({ message: 'Appointment cancelled/deleted successfully' });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
