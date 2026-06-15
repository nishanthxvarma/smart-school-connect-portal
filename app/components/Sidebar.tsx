'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  School, LayoutDashboard, Calendar, Bell, FileText, ClipboardList, BookOpen, 
  UserCheck, Award, MessageSquare, AlertTriangle, LogOut, Menu, X, Users
} from 'lucide-react';

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Manage Users', href: '/admin/users', icon: Users },
    { name: 'Manage Classes', href: '/admin/classes', icon: ClipboardList },
    { name: 'Infrastructure Issues', href: '/admin/issues', icon: AlertTriangle },
    { name: 'Calendar & Events', href: '/admin/calendar', icon: Calendar },
    { name: 'School Reports', href: '/admin/reports', icon: FileText }
  ];

  const teacherLinks = [
    { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { name: 'Notice Board', href: '/teacher/notices', icon: Bell },
    { name: 'Homework Board', href: '/teacher/homework', icon: ClipboardList },
    { name: 'Attendance Manager', href: '/teacher/attendance', icon: UserCheck },
    { name: 'Student Marks', href: '/teacher/marks', icon: FileText },
    { name: 'Study Resources', href: '/teacher/resources', icon: BookOpen },
    { name: 'PTM Appointments', href: '/teacher/appointments', icon: MessageSquare },
    { name: 'School Calendar', href: '/teacher/calendar', icon: Calendar }
  ];

  const parentLinks = [
    { name: 'Dashboard', href: '/parent', icon: LayoutDashboard },
    { name: 'School Notices', href: '/parent/notices', icon: Bell },
    { name: 'Child Homework', href: '/parent/homework', icon: ClipboardList },
    { name: 'Child Attendance', href: '/parent/attendance', icon: UserCheck },
    { name: 'Academic Results', href: '/parent/marks', icon: FileText },
    { name: 'PTM Appointments', href: '/parent/appointments', icon: MessageSquare },
    { name: 'School Calendar', href: '/parent/calendar', icon: Calendar },
    { name: 'Suggestions / Feedback', href: '/parent/feedback', icon: Award },
    { name: 'Report Infrastructure Issue', href: '/parent/issues', icon: AlertTriangle }
  ];

  const studentLinks = [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'My Homework', href: '/student/homework', icon: ClipboardList },
    { name: 'Learning Resources', href: '/student/resources', icon: BookOpen },
    { name: 'My Performance', href: '/student/marks', icon: Award },
    { name: 'My Attendance', href: '/student/attendance', icon: UserCheck },
    { name: 'School Calendar', href: '/student/calendar', icon: Calendar },
    { name: 'Report School Issue', href: '/student/issues', icon: AlertTriangle }
  ];

  const getLinks = () => {
    switch (user.role) {
      case 'ADMIN': return adminLinks;
      case 'TEACHER': return teacherLinks;
      case 'PARENT': return parentLinks;
      case 'STUDENT': return studentLinks;
      default: return [];
    }
  };

  const links = getLinks();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-xl text-white">
          <School className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-white tracking-wide text-sm">SMART SCHOOL</h2>
          <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">{user.role} PORTAL</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/15' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="px-4 py-2 mb-3">
          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between bg-slate-900 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <School className="w-5 h-5 text-blue-500" />
          <h1 className="font-bold text-sm tracking-wide">SMART SCHOOL</h1>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-300"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0 shadow-xl border-r border-slate-200 z-20">
        <NavContent />
      </aside>

      {/* Mobile Sidebar (Drawer Overlay) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer Menu */}
          <div className="relative w-72 h-full flex flex-col bg-slate-900 animate-slide-right shadow-2xl z-50">
            <NavContent />
          </div>
        </div>
      )}
    </>
  );
}
