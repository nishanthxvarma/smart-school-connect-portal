import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Please enter username/email and password');
        }

        const usernameOrEmail = credentials.username.trim().toLowerCase();

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: usernameOrEmail },
              { username: usernameOrEmail }
            ]
          }
        });

        if (!user || !user.passwordHash) {
          throw new Error('Invalid username/email or password');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error('Invalid username/email or password');
        }

        // Fetch profile ID based on role
        let profileId: string | null = null;
        let classId: string | null = null;

        if (user.role === 'TEACHER') {
          const profile = await prisma.teacher.findUnique({
            where: { userId: user.id }
          });
          profileId = profile?.id || null;
        } else if (user.role === 'PARENT') {
          const profile = await prisma.parent.findUnique({
            where: { userId: user.id }
          });
          profileId = profile?.id || null;
        } else if (user.role === 'STUDENT') {
          const profile = await prisma.student.findUnique({
            where: { userId: user.id }
          });
          profileId = profile?.id || null;
          classId = profile?.classId || null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileId,
          classId
        } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.profileId = (user as any).profileId;
        token.classId = (user as any).classId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).profileId = token.profileId;
        (session.user as any).classId = token.classId;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'smart-school-connect-secret-key-2026',
};
