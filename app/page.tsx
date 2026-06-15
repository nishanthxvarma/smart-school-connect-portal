import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;
  if (role === 'ADMIN') redirect('/admin');
  if (role === 'TEACHER') redirect('/teacher');
  if (role === 'PARENT') redirect('/parent');
  if (role === 'STUDENT') redirect('/student');

  redirect('/login');
}
