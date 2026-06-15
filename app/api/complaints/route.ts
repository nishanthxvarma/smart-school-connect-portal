import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const filter: any = {};

    // Regular users can only see issues they reported
    if (user.role !== 'ADMIN') {
      filter.reporterId = user.id;
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    const complaints = await prisma.complaint.findMany({
      where: filter,
      include: {
        reporter: { select: { name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(complaints);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse('Unauthorized', 401);

    const body = await req.json();
    const { title, description, category, photoUrl } = body;

    if (!title || !description || !category) {
      return errorResponse('Missing required fields: title, description, category');
    }

    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        category,
        photoUrl,
        reporterId: user.id
      }
    });

    // Notify Admins about the new complaint
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          title: `New School Issue Reported`,
          message: `Category: ${category.replace(/_/g, ' ')}. Title: ${title}`,
          type: 'COMPLAINT'
        }))
      });
    }

    return successResponse(complaint, 201);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
