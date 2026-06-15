import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return errorResponse('Unauthorized', 401);

    const classes = await prisma.class.findMany({
      include: {
        teacher: { include: { user: { select: { name: true } } } },
        _count: { select: { students: true } }
      },
      orderBy: { name: 'asc' }
    });

    return successResponse(classes);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return errorResponse('Unauthorized', 403);
    }

    const body = await req.json();
    const { name, teacherId } = body;

    if (!name) {
      return errorResponse('Missing required field: name');
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        teacherId: teacherId || null
      }
    });

    return successResponse(newClass, 201);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
