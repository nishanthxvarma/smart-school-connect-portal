import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';
import bcrypt from 'bcryptjs';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return errorResponse('Unauthorized', 403);
    }

    const { id } = await params;
    const body = await req.json();
    const { name, email, username, password, profileData } = body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) return errorResponse('User not found', 404);

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.trim().toLowerCase();
    if (username) updateData.username = username.trim().toLowerCase();
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update User
      await tx.user.update({
        where: { id },
        data: updateData
      });

      // 2. Update Profile
      if (existingUser.role === 'TEACHER' && profileData) {
        await tx.teacher.update({
          where: { userId: id },
          data: {
            employeeId: profileData.employeeId,
            subjectSpecialty: profileData.subjectSpecialty,
            phone: profileData.phone
          }
        });
      } else if (existingUser.role === 'PARENT' && profileData) {
        await tx.parent.update({
          where: { userId: id },
          data: {
            phone: profileData.phone,
            address: profileData.address
          }
        });
      } else if (existingUser.role === 'STUDENT' && profileData) {
        await tx.student.update({
          where: { userId: id },
          data: {
            rollNumber: profileData.rollNumber,
            classId: profileData.classId,
            parentId: profileData.parentId || null
          }
        });
      }
    });

    return successResponse({ message: 'User updated successfully' });
  } catch (err: any) {
    return errorResponse(err.message, 400);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return errorResponse('Unauthorized', 403);
    }

    const { id } = await params;

    if (id === user.id) {
      return errorResponse('Cannot delete your own admin account', 400);
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return errorResponse('User not found', 404);

    await prisma.user.delete({ where: { id } });
    return successResponse({ message: 'User deleted successfully' });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
