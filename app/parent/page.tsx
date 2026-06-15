'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, UserCheck, ClipboardList, Award, Calendar, 
  MessageSquare, Loader2, AlertCircle, Eye, ShieldAlert,
  ArrowRight, Info
} from 'lucide-react';
import Link from 'next/link';

interface ChildData {
  studentId: string;
  name: string;
  rollNumber: string;
  className: string;
  attendance: {
    total: number;
    present: number;
    late: number;
    absent: number;
    percentage: number;
  };
  homeworks: Array<{
    id: string;
    subject: string;
    description: string;
    dueDate: string;
  }>;
  marks: Array<{
    id: string;
    subject: string;
    examName: string;
    score: number;
    maxScore: number;
    remarks: string | null;
  }>;
}

interface ParentStats {
  role: string;
  children: ChildData[];
  appointments: Array<{
    id: string;
    purpose: string;
    preferredDate: string;
    status: string;
    rescheduleDate: string | null;
    remarks: string | null;
    teacher: { user: { name: string } };
  }>;
}

export default function ParentDashboard() {
  const [stats, setStats] = useState<ParentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChildId, setActiveChildId] = useState<string>('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          if (data.children && data.children.length > 0) {
            setActiveChildId(data.children[0].studentId);
          }
        } else {
          setError('Failed to fetch parent dashboard statistics.');
        }
      } catch (err) {
        setError('Error connecting to school server.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Retrieving student records...</p>
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

  const activeChild = stats.children.find(c => c.studentId === activeChildId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-bold px-2 py-0.5 rounded-full">PENDING</span>;
      case 'APPROVED':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded-full">APPROVED</span>;
      case 'REJECTED':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-bold px-2 py-0.5 rounded-full">DECLINED</span>;
      case 'RESCHEDULED':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold px-2 py-0.5 rounded-full">RESCHEDULED</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Parent Dashboard</h2>
        <p className="text-sm text-slate-500">Monitor academic standings, attendance track sheets, and book PTM appointments</p>
      </div>

      {/* Children Tab Selectors (if > 1) */}
      {stats.children.length > 1 && (
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
          {stats.children.map(child => (
            <button
              key={child.studentId}
              onClick={() => setActiveChildId(child.studentId)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                activeChildId === child.studentId
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      )}

      {activeChild ? (
        <div className="space-y-6 animate-fade-in">
          {/* Child Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Attendance Rate</span>
                <p className="text-2xl font-extrabold text-slate-800">{activeChild.attendance.percentage}%</p>
                <span className="text-[10px] text-slate-400">Class: {activeChild.className}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Present Days</span>
                <p className="text-2xl font-extrabold text-slate-800">{activeChild.attendance.present} Days</p>
                <span className="text-[10px] text-slate-400">Late arrivals: {activeChild.attendance.late}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Absent Days</span>
                <p className="text-2xl font-extrabold text-rose-600">{activeChild.attendance.absent} Days</p>
                <span className="text-[10px] text-slate-400">Out of {activeChild.attendance.total} total days</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Homework</span>
                <p className="text-2xl font-extrabold text-slate-800">{activeChild.homeworks.length} Tasks</p>
                <span className="text-[10px] text-slate-400">Due within this week</span>
              </div>
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white">
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Homework List */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Assigned Homework</h3>
                <Link href="/parent/homework" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {activeChild.homeworks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No pending homework.
                  </div>
                ) : (
                  activeChild.homeworks.map(hw => (
                    <div key={hw.id} className="p-3 border border-slate-100 rounded-xl space-y-1 bg-slate-55/10">
                      <p className="text-xs font-bold text-slate-800">{hw.subject} Assignment</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{hw.description}</p>
                      <p className="text-[9px] text-slate-400 pt-1 font-semibold">Due: {new Date(hw.dueDate).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Academic Marks */}
            <div className="lg:col-span-2 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Academic Scorecard</h3>
                <Link href="/parent/marks" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                  Progress Report
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-100">
                      <th className="p-3">Subject</th>
                      <th className="p-3">Exam/Test</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {activeChild.marks.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400">No marks entries recorded yet.</td>
                      </tr>
                    ) : (
                      activeChild.marks.map(mark => (
                        <tr key={mark.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold">{mark.subject}</td>
                          <td className="p-3 font-medium text-slate-500">{mark.examName}</td>
                          <td className="p-3 font-bold text-slate-800">{mark.score} / {mark.maxScore}</td>
                          <td className="p-3 italic text-slate-400 truncate max-w-xs">{mark.remarks || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-400">
          No child information linked. Please contact the administrator.
        </div>
      )}

      {/* PTM Appointments Requests */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
          <h3 className="text-sm font-bold text-slate-800">PTM Scheduled Appointments</h3>
          <Link href="/parent/appointments" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
            Request Meeting
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.appointments.length === 0 ? (
            <div className="col-span-2 p-8 text-center text-xs text-slate-400 border border-dashed border-slate-150 rounded-xl">
              No meetings scheduled. Click &quot;Request Meeting&quot; to coordinate with class teachers.
            </div>
          ) : (
            stats.appointments.map(app => (
              <div key={app.id} className="p-4 border border-slate-100 rounded-xl space-y-3 bg-slate-55/10 hover:shadow-sm transition-all flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Teacher: {app.teacher.user.name}</span>
                    {getStatusBadge(app.status)}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 pt-1">Purpose: {app.purpose}</h4>
                  <p className="text-[10px] text-slate-500">
                    Preferred: {new Date(app.preferredDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                  {app.status === 'RESCHEDULED' && app.rescheduleDate && (
                    <div className="bg-amber-50 text-amber-800 p-2 rounded-lg border border-amber-200 text-[10px] mt-2 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      Teacher requested: {new Date(app.rescheduleDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  )}
                  {app.remarks && (
                    <p className="text-[10px] text-slate-400 italic pt-1">Teacher remarks: {app.remarks}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
