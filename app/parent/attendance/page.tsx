'use client';

import React, { useEffect, useState } from 'react';
import { 
  UserCheck, Loader2, AlertCircle, Calendar, ShieldCheck
} from 'lucide-react';

interface AttendanceItem {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  remarks: string | null;
  student: { user: { name: string } };
  markedBy: { user: { name: string } };
}

export default function ParentAttendancePage() {
  const [logs, setLogs] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const res = await fetch('/api/attendance');
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        } else {
          setError('Failed to fetch attendance logs.');
        }
      } catch (err) {
        setError('Connection failure.');
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">PRESENT</span>;
      case 'ABSENT':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">ABSENT</span>;
      case 'LATE':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">LATE</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Child Attendance Logs</h2>
        <p className="text-sm text-slate-500">Track and monitor your child&apos;s daily attendance record and remarks</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading attendance logs...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-rose-800">Connection Failed</h2>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No attendance logs recorded for your child.
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-100">
                  <th className="p-4">Student</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Remarks</th>
                  <th className="p-4">Marked By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-55/10">
                    <td className="p-4 font-bold text-slate-800">{log.student.user.name}</td>
                    <td className="p-4 font-semibold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">{getStatusBadge(log.status)}</td>
                    <td className="p-4 italic text-slate-400 font-medium">{log.remarks || '-'}</td>
                    <td className="p-4 font-medium text-slate-600">{log.markedBy.user.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
