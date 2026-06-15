import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user as any;
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}
