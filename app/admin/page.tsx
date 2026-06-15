'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, UserCheck, MessageSquare, AlertTriangle, Calendar, Award, 
  ArrowRight, Loader2, Sparkles, TrendingUp, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

interface StatsData {
  summary: {
    totalStudents: number;
    totalTeachers: number;
    totalParents: number;
    attendancePercentage: number;
    upcomingEventsCount: number;
    pendingComplaints: number;
  };
  upcomingEvents: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
  }>;
  charts: {
    complaintCategoriesChart: Array<{ name: string; value: number }>;
    attendanceTrendsChart: Array<{ date: string; percentage: number }>;
    parentEngagementChart: Array<{ name: string; count: number }>;
  };
}

const COLORS = ['#3b82f6', '#f43f5e', '#a855f7', '#eab308', '#10b981', '#6366f1'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          setError('Failed to fetch dashboard statistics.');
        }
      } catch (err) {
        setError('Error connecting to backend services.');
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
        <p className="text-sm font-semibold text-slate-500">Compiling school metrics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto mt-10">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-rose-800">Dashboard Loading Failed</h2>
        <p className="text-sm text-rose-600 mt-1">{error || 'Unable to retrieve statistics.'}</p>
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
      title: 'Total Students',
      value: stats.summary.totalStudents,
      description: 'Enrolled in classes 9 to 10',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/10'
    },
    {
      title: 'Total Teachers',
      value: stats.summary.totalTeachers,
      description: 'Assigned academic staff',
      icon: UserCheck,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/10'
    },
    {
      title: 'Total Parents',
      value: stats.summary.totalParents,
      description: 'Registered guardians',
      icon: Users,
      color: 'from-purple-500 to-fuchsia-600',
      shadow: 'shadow-purple-500/10'
    },
    {
      title: 'Attendance Rate',
      value: `${stats.summary.attendancePercentage}%`,
      description: 'Cumulative student rate',
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/10'
    },
    {
      title: 'Upcoming Events',
      value: stats.summary.upcomingEventsCount,
      description: 'Scheduled activities',
      icon: Calendar,
      color: 'from-cyan-500 to-blue-600',
      shadow: 'shadow-cyan-500/10'
    },
    {
      title: 'Pending Complaints',
      value: stats.summary.pendingComplaints,
      description: 'Needs admin review',
      icon: AlertTriangle,
      color: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            School Overview & Control
          </h2>
          <p className="text-sm text-slate-500">Real-time indicators, community logs, and statistics</p>
        </div>
        <Link 
          href="/admin/reports" 
          className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-md transition-all active:scale-95"
        >
          Generate Reports
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div 
              key={c.title}
              className={`bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all ${c.shadow}`}
            >
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{c.title}</span>
                <p className="text-2xl font-extrabold text-slate-800">{c.value}</p>
                <span className="text-xs text-slate-400">{c.description}</span>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-tr ${c.color} text-white`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attendance Trends */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Attendance Trends (Last 5 Days)</h3>
          <div className="h-72">
            {stats.charts.attendanceTrendsChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.charts.attendanceTrendsChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                  <Area type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAttendance)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No attendance logs found to plot trends.
              </div>
            )}
          </div>
        </div>

        {/* Complaint Categories (Issues breakdown) */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col">
          <h3 className="text-sm font-bold text-slate-800">Infrastructure Issue Categories</h3>
          <div className="flex-1 h-56 relative">
            {stats.charts.complaintCategoriesChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.charts.complaintCategoriesChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.charts.complaintCategoriesChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No infrastructure reports recorded.
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] mt-2 border-t border-slate-50 pt-3">
            {stats.charts.complaintCategoriesChart.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-slate-500 truncate">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Parent Engagement Stats */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Parent Engagement Metrics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.parentEngagementChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {stats.charts.parentEngagementChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#06b6d4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <h3 className="text-sm font-bold text-slate-800">Upcoming Calendar Events</h3>
            <Link href="/admin/calendar" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
              Manage Events
            </Link>
          </div>
          <div className="space-y-3">
            {stats.upcomingEvents.length > 0 ? (
              stats.upcomingEvents.map((ev) => (
                <div key={ev.id} className="flex gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all border border-slate-50">
                  <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl text-center shrink-0 w-12 h-12 flex flex-col justify-center items-center">
                    <span className="text-[10px] font-bold uppercase">
                      {new Date(ev.date).toLocaleDateString([], { month: 'short' })}
                    </span>
                    <span className="text-sm font-extrabold leading-none">
                      {new Date(ev.date).toLocaleDateString([], { day: '2-digit' })}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{ev.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1 leading-normal">{ev.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No upcoming events scheduled.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
