import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'TEACHER') {
      return errorResponse('Unauthorized', 403);
    }

    const { id } = await params;
    const body = await req.json();
    const { subject, examName, score, maxScore, remarks } = body;

    const mark = await prisma.mark.findUnique({ where: { id } });
    if (!mark) return errorResponse('Mark record not found', 404);

    if (mark.gradedById !== user.profileId) {
      return errorResponse('Unauthorized to modify this grade record', 403);
    }

    const updated = await prisma.mark.update({
      where: { id },
      data: {
        subject: subject || mark.subject,
        examName: examName || mark.examName,
        score: score !== undefined ? parseFloat(score) : mark.score,
        maxScore: maxScore !== undefined ? parseFloat(maxScore) : mark.maxScore,
        remarks: remarks !== undefined ? remarks : mark.remarks
      }
    });

    return successResponse(updated);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'TEACHER') {
      return errorResponse('Unauthorized', 403);
    }

    const { id } = await params;
    const mark = await prisma.mark.findUnique({ where: { id } });
    if (!mark) return errorResponse('Mark record not found', 404);

    if (mark.gradedById !== user.profileId) {
      return errorResponse('Unauthorized to delete this grade record', 403);
    }

    await prisma.mark.delete({ where: { id } });
    return successResponse({ message: 'Mark record deleted successfully' });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
