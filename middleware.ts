import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Role-based route protection
    if (path.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL(getRedirectUrl(token.role as string), req.url));
    }
    if (path.startsWith('/teacher') && token.role !== 'TEACHER') {
      return NextResponse.redirect(new URL(getRedirectUrl(token.role as string), req.url));
    }
    if (path.startsWith('/parent') && token.role !== 'PARENT') {
      return NextResponse.redirect(new URL(getRedirectUrl(token.role as string), req.url));
    }
    if (path.startsWith('/student') && token.role !== 'STUDENT') {
      return NextResponse.redirect(new URL(getRedirectUrl(token.role as string), req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

function getRedirectUrl(role?: string) {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'TEACHER':
      return '/teacher';
    case 'PARENT':
      return '/parent';
    case 'STUDENT':
      return '/student';
    default:
      return '/login';
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/teacher/:path*',
    '/parent/:path*',
    '/student/:path*',
  ],
};
