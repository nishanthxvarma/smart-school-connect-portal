'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { School, ArrowRight, ShieldCheck, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        username,
        password,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // Successful login, fetch user session to determine role and redirect
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          const role = data.role;
          if (role === 'ADMIN') router.push('/admin');
          else if (role === 'TEACHER') router.push('/teacher');
          else if (role === 'PARENT') router.push('/parent');
          else if (role === 'STUDENT') router.push('/student');
          else router.push('/');
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const fillCredentials = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 flex flex-col justify-center items-center p-4">
      {/* Portal Header */}
      <div className="flex items-center gap-3 mb-6 text-white animate-fade-in">
        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg border border-blue-400/30">
          <School className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-wide">SMART CONNECT</h1>
          <p className="text-xs text-blue-300 font-medium">GOVERNMENT HIGH SCHOOL PORTAL</p>
        </div>
      </div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-sm text-slate-500 mt-1">Please sign in to access your dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3 mb-5 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="e.g. admin, student"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-98 transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Credentials Quick-Click Board */}
        <div className="bg-slate-50 border-t border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3>Demo Login Credentials</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">Click any profile below to pre-fill the form:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => fillCredentials('admin', 'admin123')}
              className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-2.5 rounded-xl text-left transition-all font-medium text-slate-700 active:scale-98 shadow-sm flex flex-col gap-0.5"
            >
              <span className="text-[10px] text-blue-600 font-semibold tracking-wider">ADMIN</span>
              <span className="truncate">admin / admin123</span>
            </button>
            <button
              onClick={() => fillCredentials('teacher', 'teacher123')}
              className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-2.5 rounded-xl text-left transition-all font-medium text-slate-700 active:scale-98 shadow-sm flex flex-col gap-0.5"
            >
              <span className="text-[10px] text-emerald-600 font-semibold tracking-wider">TEACHER</span>
              <span className="truncate">teacher / teacher123</span>
            </button>
            <button
              onClick={() => fillCredentials('parent', 'parent123')}
              className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-2.5 rounded-xl text-left transition-all font-medium text-slate-700 active:scale-98 shadow-sm flex flex-col gap-0.5"
            >
              <span className="text-[10px] text-purple-600 font-semibold tracking-wider">PARENT</span>
              <span className="truncate">parent / parent123</span>
            </button>
            <button
              onClick={() => fillCredentials('student', 'student123')}
              className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-2.5 rounded-xl text-left transition-all font-medium text-slate-700 active:scale-98 shadow-sm flex flex-col gap-0.5"
            >
              <span className="text-[10px] text-amber-600 font-semibold tracking-wider">STUDENT</span>
              <span className="truncate">student / student123</span>
            </button>
          </div>
        </div>
      </div>
      <p className="text-slate-400 text-xs mt-6">© 2026 Smart School Connect Portal. All rights reserved.</p>
    </div>
  );
}
