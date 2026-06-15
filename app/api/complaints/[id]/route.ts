import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse('Unauthorized', 401);

    const { id } = await params;
    const body = await req.json();
    const { title, description, category, status, photoUrl } = body;

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) return errorResponse('Complaint not found', 404);

    let updated;

    if (user.role === 'ADMIN') {
      // Admin can update status and metadata
      updated = await prisma.complaint.update({
        where: { id },
        data: {
          status: status || complaint.status
        }
      });

      // Send status change notification to reporter
      if (status && status !== complaint.status) {
        await prisma.notification.create({
          data: {
            userId: complaint.reporterId,
            title: `Issue Status Update: ${status}`,
            message: `Your reported issue "${complaint.title}" is now "${status.replace(/_/g, ' ')}".`,
            type: 'COMPLAINT'
          }
        });
      }
    } else {
      // Reporter can update but only if status is SUBMITTED
      if (complaint.reporterId !== user.id) {
        return errorResponse('Unauthorized to modify this complaint', 403);
      }
      if (complaint.status !== 'SUBMITTED') {
        return errorResponse('Cannot edit a complaint that is already under review or resolved', 400);
      }

      updated = await prisma.complaint.update({
        where: { id },
        data: {
          title: title || complaint.title,
          description: description || complaint.description,
          category: category || complaint.category,
          photoUrl: photoUrl !== undefined ? photoUrl : complaint.photoUrl
        }
      });
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
    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) return errorResponse('Complaint not found', 404);

    if (user.role !== 'ADMIN') {
      if (complaint.reporterId !== user.id) {
        return errorResponse('Unauthorized to delete this complaint', 403);
      }
      if (complaint.status !== 'SUBMITTED') {
        return errorResponse('Cannot delete a complaint that is already under review or resolved', 400);
      }
    }

    await prisma.complaint.delete({ where: { id } });
    return successResponse({ message: 'Complaint deleted successfully' });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
