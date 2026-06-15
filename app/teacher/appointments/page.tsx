'use client';

import React, { useEffect, useState } from 'react';
import { 
  MessageSquare, Loader2, AlertCircle, Calendar, 
  User, Check, X, CalendarClock, ArrowRight
} from 'lucide-react';

interface AppointmentItem {
  id: string;
  purpose: string;
  preferredDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESCHEDULED';
  rescheduleDate: string | null;
  remarks: string | null;
  parent: { phone: string; user: { name: string; email: string } };
  createdAt: string;
}

export default function TeacherAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      } else {
        setError('Failed to fetch PTM appointments.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setAppointments(prev =>
          prev.map(app => (app.id === id ? { ...app, status } : app))
        );
      } else {
        alert('Action failed.');
      }
    } catch (err) {
      alert('Connection error.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full">PENDING REVIEW</span>;
      case 'APPROVED':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 text-[10px] font-bold px-2 py-0.5 rounded-full">APPROVED</span>;
      case 'REJECTED':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">DECLINED</span>;
      case 'RESCHEDULED':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">RESCHEDULED</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          PTM Meeting Appointments
        </h2>
        <p className="text-sm text-slate-500">Review, approve, or decline parent-teacher conference requests</p>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading appointments...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-rose-800">Connection Failed</h2>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No meeting requests recorded.
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-100">
                  <th className="p-4">Parent Details</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4">Preferred Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-55/10">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{app.parent.user.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Phone: {app.parent.phone}</p>
                    </td>
                    <td className="p-4 max-w-xs truncate" title={app.purpose}>
                      {app.purpose}
                    </td>
                    <td className="p-4 font-semibold text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(app.preferredDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </td>
                    <td className="p-4">{getStatusBadge(app.status)}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        {app.status === 'PENDING' ? (
                          updatingId === app.id ? (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                          ) : (
                            <>
                              <button
                                onClick={() => handleAction(app.id, 'APPROVED')}
                                className="p-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] shadow transition-all active:scale-95"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(app.id, 'REJECTED')}
                                className="p-1 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[10px] shadow transition-all active:scale-95"
                              >
                                Decline
                              </button>
                            </>
                          )
                        ) : (
                          <span className="text-[10px] text-slate-400 italic font-semibold">Processed</span>
                        )}
                      </div>
                    </td>
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
