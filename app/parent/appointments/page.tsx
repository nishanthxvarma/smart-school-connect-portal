'use client';

import React, { useEffect, useState } from 'react';
import { 
  MessageSquare, Plus, Loader2, AlertCircle, Calendar, 
  User, Check, X, CalendarClock, ArrowRight, ShieldCheck
} from 'lucide-react';

interface TeacherItem {
  id: string;
  user: { name: string };
}

interface AppointmentItem {
  id: string;
  purpose: string;
  preferredDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESCHEDULED';
  rescheduleDate: string | null;
  remarks: string | null;
  teacher: { user: { name: string } };
  createdAt: string;
}

export default function ParentAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [teacherId, setTeacherId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [preferredDate, setPreferredDate] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const appRes = await fetch('/api/appointments');
      if (appRes.ok) {
        const appData = await resData(appRes);
        setAppointments(appData);
      } else {
        setError('Failed to fetch PTM appointments.');
      }

      const teacherRes = await fetch('/api/admin/users?role=TEACHER');
      if (teacherRes.ok) {
        const teacherData = await resData(teacherRes);
        setTeachers(teacherData);
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  const resData = async (res: Response) => {
    return await res.json();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setTeacherId('');
    setPurpose('');
    setPreferredDate('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!teacherId || !purpose || !preferredDate) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId, purpose, preferredDate: new Date(preferredDate) })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to submit request.');
      }
    } catch (err) {
      setError('Error connecting to school server.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">PENDING REVIEW</span>;
      case 'APPROVED':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-255 text-[10px] font-bold px-2.5 py-0.5 rounded-full">APPROVED</span>;
      case 'REJECTED':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">DECLINED</span>;
      case 'RESCHEDULED':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">RESCHEDULED</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            PTM Meeting Appointments
          </h2>
          <p className="text-sm text-slate-500">Request and monitor meeting schedules with class teachers</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/15 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          Request Meeting
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading appointments...</span>
        </div>
      ) : error && appointments.length === 0 ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-rose-800">Connection Failed</h2>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No meeting requests registered yet. Click &quot;Request Meeting&quot; to arrange a PTM.
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-100">
                  <th className="p-4">Teacher Name</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4">Preferred Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-55/10">
                    <td className="p-4 font-bold text-slate-800">{app.teacher.user.name}</td>
                    <td className="p-4 font-medium text-slate-600">{app.purpose}</td>
                    <td className="p-4 font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(app.preferredDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </td>
                    <td className="p-4">{getStatusBadge(app.status)}</td>
                    <td className="p-4 italic text-slate-400 font-medium">
                      {app.status === 'RESCHEDULED' && app.rescheduleDate ? (
                        <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                          Rescheduled: {new Date(app.rescheduleDate).toLocaleDateString()}
                        </span>
                      ) : (
                        app.remarks || '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-scale-up">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Request PTM Meeting</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            {error && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs font-semibold rounded-r-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Teacher</label>
                <select
                  required
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="block w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">Select a teacher...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.user.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Preferred Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Meeting Purpose</label>
                <textarea
                  required
                  placeholder="Explain the topic you would like to discuss (e.g. child marks, health, behavioral concerns)..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={3}
                  className="block w-full p-2 border border-slate-200 rounded-lg text-xs resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Request PTM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
