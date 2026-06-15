import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Build filter
    const filter: any = {};

    // Students and Parents only see published notices
    if (user.role === 'STUDENT' || user.role === 'PARENT') {
      filter.isPublished = true;
      filter.publishDate = { lte: new Date() };
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const notices = await prisma.notice.findMany({
      where: filter,
      include: {
        createdBy: { select: { name: true, role: true } }
      },
      orderBy: { publishDate: 'desc' }
    });

    return successResponse(notices);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')) {
      return errorResponse('Unauthorized', 403);
    }

    const body = await req.json();
    const { title, content, category, scheduledDate, isPublished } = body;

    if (!title || !content || !category) {
      return errorResponse('Missing required fields: title, content, category');
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        category,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        isPublished: isPublished !== undefined ? isPublished : true,
        publishDate: scheduledDate ? new Date(scheduledDate) : new Date(),
        createdById: user.id
      }
    });

    // Create notifications for all users (except teacher who created it)
    const allUsers = await prisma.user.findMany({
      where: { id: { not: user.id } },
      select: { id: true }
    });

    if (allUsers.length > 0) {
      await prisma.notification.createMany({
        data: allUsers.map(u => ({
          userId: u.id,
          title: `New Notice: ${title}`,
          message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          type: 'NOTICE'
        }))
      });
    }

    return successResponse(notice, 201);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
