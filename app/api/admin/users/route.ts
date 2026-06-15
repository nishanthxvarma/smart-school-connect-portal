import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser, errorResponse, successResponse } from '@/lib/api-helper';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'ADMIN') {
      return errorResponse('Unauthorized', 403);
    }

    const { searchParams } = new URL(req.url);
    const roleType = searchParams.get('role'); // TEACHER, STUDENT, PARENT

    if (roleType === 'STUDENT') {
      const students = await prisma.student.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, username: true, role: true } },
          class: { select: { id: true, name: true } },
          parent: { include: { user: { select: { name: true } } } }
        },
        orderBy: { rollNumber: 'asc' }
      });
      return successResponse(students);
    }

    if (roleType === 'TEACHER') {
      const teachers = await prisma.teacher.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, username: true, role: true } },
          classes: { select: { id: true, name: true } }
        },
        orderBy: { employeeId: 'asc' }
      });
      return successResponse(teachers);
    }

    if (roleType === 'PARENT') {
      const parents = await prisma.parent.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, username: true, role: true } },
          students: { include: { user: { select: { name: true } } } }
        },
        orderBy: { id: 'asc' }
      });
      return successResponse(parents);
    }

    // Default: fetch all users
    const allUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, username: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(allUsers);
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
    const { name, email, username, password, role, profileData } = body;

    if (!name || !email || !username || !password || !role) {
      return errorResponse('Missing required fields: name, email, username, password, role');
    }

    const emailLower = email.trim().toLowerCase();
    const usernameLower = username.trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailLower },
          { username: usernameLower }
        ]
      }
    });

    if (existing) {
      return errorResponse('User with this email or username already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      // 1. Create Base User
      const createdUser = await tx.user.create({
        data: {
          name,
          email: emailLower,
          username: usernameLower,
          passwordHash,
          role
        }
      });

      // 2. Create Profile
      if (role === 'TEACHER') {
        if (!profileData?.employeeId || !profileData?.subjectSpecialty || !profileData?.phone) {
          throw new Error('Teacher profiles require employeeId, subjectSpecialty, and phone');
        }
        await tx.teacher.create({
          data: {
            userId: createdUser.id,
            employeeId: profileData.employeeId,
            subjectSpecialty: profileData.subjectSpecialty,
            phone: profileData.phone
          }
        });
      } else if (role === 'PARENT') {
        if (!profileData?.phone || !profileData?.address) {
          throw new Error('Parent profiles require phone and address');
        }
        await tx.parent.create({
          data: {
            userId: createdUser.id,
            phone: profileData.phone,
            address: profileData.address
          }
        });
      } else if (role === 'STUDENT') {
        if (!profileData?.rollNumber || !profileData?.classId) {
          throw new Error('Student profiles require rollNumber and classId');
        }
        await tx.student.create({
          data: {
            userId: createdUser.id,
            rollNumber: profileData.rollNumber,
            classId: profileData.classId,
            parentId: profileData.parentId || null
          }
        });
      }

      return createdUser;
    });

    return successResponse({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }, 201);
  } catch (err: any) {
    return errorResponse(err.message, 400);
  }
}
