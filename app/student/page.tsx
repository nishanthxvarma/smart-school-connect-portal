'use client';

import React, { useEffect, useState } from 'react';
import { 
  Award, Calendar, ClipboardList, BookOpen, UserCheck, 
  Loader2, AlertCircle, Eye, Download, Trophy, Star, FileText
} from 'lucide-react';
import Link from 'next/link';

interface StudentStats {
  attendance: {
    present: number;
    late: number;
    absent: number;
    total: number;
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
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    category: 'ACADEMIC' | 'SPORTS' | 'COMPETITION';
    certificateUrl: string | null;
    dateAwarded: string;
  }>;
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<StudentStats | null>(null);
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
          setError('Failed to fetch your academic statistics.');
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
        <p className="text-sm font-semibold text-slate-500">Opening student profile...</p>
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
      title: 'My Attendance Rate',
      value: `${stats.attendance.percentage}%`,
      description: `Present: ${stats.attendance.present} | Absent: ${stats.attendance.absent}`,
      icon: UserCheck,
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/10'
    },
    {
      title: 'My Pending Homework',
      value: stats.homeworks.length,
      description: 'Tasks due this week',
      icon: ClipboardList,
      color: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/10'
    },
    {
      title: 'Graded Subjects',
      value: stats.marks.length,
      description: 'Recent exams evaluated',
      icon: FileText,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/10'
    },
    {
      title: 'My Achievements',
      value: stats.achievements.length,
      description: 'Trophies and certificates',
      icon: Trophy,
      color: 'from-purple-500 to-fuchsia-600',
      shadow: 'shadow-purple-500/10'
    }
  ];



  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">My Student Space</h2>
        <p className="text-sm text-slate-500">Access your homework, grades, class files, and school schedule</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
              <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${c.color} text-white`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Homework List */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <h3 className="text-sm font-bold text-slate-800">My Homework Tasks</h3>
            <Link href="/student/homework" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {stats.homeworks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                All homework completed! No pending tasks.
              </div>
            ) : (
              stats.homeworks.map(hw => (
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
            <h3 className="text-sm font-bold text-slate-800">My Test Grades</h3>
            <Link href="/student/marks" className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
              Full Scorecard
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-100">
                  <th className="p-3">Subject</th>
                  <th className="p-3">Exam / Test</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats.marks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-400">No test scores posted yet.</td>
                  </tr>
                ) : (
                  stats.marks.slice(0, 5).map(mark => (
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

      {/* Achievement Corner */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1.5">
          <Trophy className="w-5 h-5 text-amber-500" />
          Achievement Corner
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.achievements.length === 0 ? (
            <div className="col-span-2 p-8 text-center text-slate-400 text-xs">
              No awards listed yet. Participate in co-curricular events to feature here!
            </div>
          ) : (
            stats.achievements.map(ach => (
              <div 
                key={ach.id}
                className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 hover:shadow-sm transition-all flex gap-3.5 items-start bg-amber-50/20 border-amber-100/50"
              >
                <div className="p-2.5 bg-amber-500 rounded-xl text-white shrink-0 mt-0.5 shadow shadow-amber-500/20">
                  <Star className="w-5 h-5 fill-white" />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                    {ach.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 pt-1.5">{ach.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{ach.description}</p>
                  <span className="text-[9px] text-slate-400 block pt-1">
                    Awarded: {new Date(ach.dateAwarded).toLocaleDateString()}
                  </span>
                  
                  {ach.certificateUrl && (
                    <a 
                      href={ach.certificateUrl}
                      className="inline-flex items-center gap-1 text-[9px] text-blue-600 hover:text-blue-800 font-bold pt-2 border-t border-slate-100 w-full mt-2"
                    >
                      <Download className="w-3 h-3" />
                      Download Certificate
                    </a>
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
