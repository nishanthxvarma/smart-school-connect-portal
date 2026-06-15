'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, ClipboardList, Bell, Calendar, MessageSquare, 
  Loader2, AlertCircle, Check, X, CalendarClock, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface TeacherStats {
  summary: {
    assignedClassesCount: number;
    studentCount: number;
    activeHomeworkCount: number;
    noticesCount: number;
    pendingAppointmentsCount: number;
  };
  classes: Array<{ id: string; name: string }>;
  pendingAppointments: Array<{
    id: string;
    purpose: string;
    preferredDate: string;
    parent: { user: { name: string } };
  }>;
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setError('Failed to fetch teacher stats.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAppointmentAction = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      });

      if (res.ok) {
        // Refresh stats/appointments list
        const resStats = await fetch('/api/stats');
        if (resStats.ok) {
          const data = await resStats.json();
          setStats(data);
        }
      } else {
        alert('Action failed.');
      }
    } catch (err) {
      alert('Connection error.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Compiling class summaries...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto mt-10">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-rose-800">Dashboard Loading Failed</h2>
        <p className="text-sm text-rose-600 mt-1">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const cards = [
    {
      title: 'Assigned Classes',
      value: stats.summary.assignedClassesCount,
      description: 'Classes you lead or instruct',
      icon: ClipboardList,
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/10'
    },
    {
      title: 'My Students',
      value: stats.summary.studentCount,
      description: 'Total enrolled students',
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/10'
    },
    {
      title: 'Active Homework',
      value: stats.summary.activeHomeworkCount,
      description: 'Assignments due soon',
      icon: ClipboardList,
      color: 'from-purple-500 to-fuchsia-600',
      shadow: 'shadow-purple-500/10'
    },
    {
      title: 'Notices Published',
      value: stats.summary.noticesCount,
      description: 'Updates posted on board',
      icon: Bell,
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/10'
    },
    {
      title: 'PTM Requests',
      value: stats.summary.pendingAppointmentsCount,
      description: 'Pending parent meetings',
      icon: MessageSquare,
      color: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Greeting info */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Teacher Workspace</h2>
        <p className="text-sm text-slate-500">Manage daily class schedules, marks entry, notices, and appointments</p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div 
              key={c.title}
              className={`bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all ${c.shadow}`}
            >
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{c.title}</span>
                <p className="text-2xl font-extrabold text-slate-800">{c.value}</p>
                <span className="text-[10px] text-slate-400">{c.description}</span>
              </div>
              <div className={`p-2 rounded-xl bg-gradient-to-tr ${c.color} text-white`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Class Shortcuts & PTM Meetings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Shortcuts */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2">Academic Operations</h3>
          <div className="grid grid-cols-1 gap-3">
            <Link 
              href="/teacher/attendance"
              className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-blue-50 border border-slate-100 hover:border-blue-100 text-slate-700 hover:text-blue-700 font-semibold text-xs transition-all active:scale-98"
            >
              <span>Mark Daily Attendance</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link 
              href="/teacher/homework"
              className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-blue-50 border border-slate-100 hover:border-blue-100 text-slate-700 hover:text-blue-700 font-semibold text-xs transition-all active:scale-98"
            >
              <span>Assign New Homework</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link 
              href="/teacher/marks"
              className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-blue-50 border border-slate-100 hover:border-blue-100 text-slate-700 hover:text-blue-700 font-semibold text-xs transition-all active:scale-98"
            >
              <span>Grade Student Tests</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link 
              href="/teacher/resources"
              className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-blue-50 border border-slate-100 hover:border-blue-100 text-slate-700 hover:text-blue-700 font-semibold text-xs transition-all active:scale-98"
            >
              <span>Upload Study Materials</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* PTM Appointments Requests */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <h3 className="text-sm font-bold text-slate-800">Pending Parent-Teacher Meetings</h3>
            <Link href="/teacher/appointments" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
              Manage Meetings
            </Link>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {stats.pendingAppointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-150 rounded-xl">
                No pending meeting requests from parents.
              </div>
            ) : (
              stats.pendingAppointments.map((app) => (
                <div key={app.id} className="p-4 border border-slate-100 hover:border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">Parent: {app.parent.user.name}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">Purpose: {app.purpose}</p>
                    
                    <div className="flex items-center gap-1.5 text-[10px] text-blue-600 font-semibold pt-1">
                      <CalendarClock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      Proposed: {new Date(app.preferredDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>

                  <div className="flex gap-2 self-end sm:self-center shrink-0">
                    {updatingId === app.id ? (
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    ) : (
                      <>
                        <button
                          onClick={() => handleAppointmentAction(app.id, 'APPROVED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleAppointmentAction(app.id, 'REJECTED')}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
