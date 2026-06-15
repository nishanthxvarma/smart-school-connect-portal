'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Loader2, Homework, Calendar, Info, ShieldAlert, BadgeAlert } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface HeaderProps {
  user: {
    name: string;
    role: string;
  };
}

export default function Header({ user }: HeaderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 45 seconds for a dynamic feel
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readAll: true })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'HOMEWORK':
        return <ClipboardListIcon className="w-4 h-4 text-amber-500" />;
      case 'NOTICE':
        return <Bell className="w-4 h-4 text-blue-500" />;
      case 'EVENT':
        return <Calendar className="w-4 h-4 text-emerald-500" />;
      case 'APPOINTMENT':
        return <Info className="w-4 h-4 text-purple-500" />;
      case 'COMPLAINT':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      default:
        return <BadgeAlert className="w-4 h-4 text-slate-500" />;
    }
  };

  const ClipboardListIcon = (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* Page Title & Info */}
      <div className="hidden sm:block">
        <h1 className="text-lg font-bold text-slate-800">Welcome, {user.name}</h1>
        <p className="text-xs text-slate-400 font-medium">{formatDate()}</p>
      </div>
      <div className="sm:hidden">
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
          {user.role}
        </span>
      </div>

      {/* Notification Center */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all active:scale-95"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-rose-500 text-[10px] text-white font-bold flex items-center justify-center rounded-full ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-55/30">
              <span className="font-bold text-slate-800 text-sm">Notifications ({unreadCount} new)</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5 transition-all"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {loading && notifications.length === 0 ? (
                <div className="p-8 flex flex-col justify-center items-center gap-2">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <span className="text-xs text-slate-400">Loading alerts...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markAsRead(n.id)}
                    className={`p-4 flex gap-3 transition-colors cursor-pointer text-left ${
                      n.read ? 'hover:bg-slate-50 bg-white' : 'bg-blue-50/50 hover:bg-blue-50'
                    }`}
                  >
                    <div className="p-2 bg-slate-100 rounded-xl h-fit shrink-0">
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className={`text-xs font-semibold text-slate-800 truncate ${!n.read && 'font-bold'}`}>
                          {n.title}
                        </h4>
                        <span className="text-[9px] text-slate-400 shrink-0">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
