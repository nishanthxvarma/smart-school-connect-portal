'use client';

import React, { useEffect, useState } from 'react';
import { 
  UserCheck, Loader2, AlertCircle, Calendar, Users, 
  Check, Save, ClipboardCheck
} from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
}

interface StudentItem {
  id: string;
  rollNumber: string;
  user: { name: string };
}

interface AttendanceState {
  [studentId: string]: {
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    remarks: string;
  };
}

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceState>({});
  
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch('/api/classes');
        if (res.ok) {
          const data = await res.json();
          setClasses(data);
          if (data.length > 0) {
            setSelectedClass(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setLoadingClasses(false);
      }
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;

    async function loadStudentsAndAttendance() {
      try {
        setLoadingStudents(true);
        setMessage(null);

        // 1. Fetch students in the selected class
        const studentRes = await fetch(`/api/admin/users?role=STUDENT`);
        if (!studentRes.ok) throw new Error('Failed to load students.');
        const allStudents = await studentRes.json();
        const classStudents = allStudents.filter((s: any) => s.classId === selectedClass);
        setStudents(classStudents);

        // 2. Fetch existing attendance records for this class on this date
        const attRes = await fetch(`/api/attendance?classId=${selectedClass}&date=${selectedDate}`);
        if (!attRes.ok) throw new Error('Failed to load attendance logs.');
        const existingLogs = await attRes.json();

        // 3. Populate state
        const initialAttendance: AttendanceState = {};
        
        classStudents.forEach((student: StudentItem) => {
          const matchedLog = existingLogs.find((log: any) => log.studentId === student.id);
          initialAttendance[student.id] = {
            status: matchedLog ? matchedLog.status : 'PRESENT', // default to Present
            remarks: matchedLog ? matchedLog.remarks || '' : ''
          };
        });

        setAttendance(initialAttendance);
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoadingStudents(false);
      }
    }

    loadStudentsAndAttendance();
  }, [selectedClass, selectedDate]);

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const saveAttendance = async () => {
    setSaving(true);
    setMessage(null);

    const records = Object.keys(attendance).map(studentId => ({
      studentId,
      status: attendance[studentId].status,
      remarks: attendance[studentId].remarks
    }));

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, records })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Attendance records successfully compiled and synced.' });
      } else {
        const errData = await res.json();
        setMessage({ type: 'error', text: errData.error || 'Failed to save attendance.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error connecting to database.' });
    } finally {
      setSaving(false);
    }
  };

  if (loadingClasses) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Initializing attendance logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-blue-600" />
          Mark Daily Attendance
        </h2>
        <p className="text-sm text-slate-500">Record present, absent, or late statuses for class students</p>
      </div>

      {/* Control selectors */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="block w-full p-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="block w-full p-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
          />
        </div>
      </div>

      {/* Feedback message */}
      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {message.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Student List Grid */}
      {loadingStudents ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Retrieving classroom logs...</span>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No students registered in this class yet.
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden space-y-4 pb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-100">
                  <th className="p-4 w-1/3">Student Details</th>
                  <th className="p-4 text-center">Status Toggle</th>
                  <th className="p-4">Remarks (Optional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((student) => {
                  const current = attendance[student.id] || { status: 'PRESENT', remarks: '' };
                  return (
                    <tr key={student.id} className="hover:bg-slate-55/10">
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{student.user.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{student.rollNumber}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-1.5">
                          {(['PRESENT', 'ABSENT', 'LATE'] as const).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleStatusChange(student.id, status)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 ${
                                current.status === status
                                  ? status === 'PRESENT'
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                    : status === 'ABSENT'
                                    ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                                    : 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <input
                          type="text"
                          placeholder="e.g. sick leave, delayed bus"
                          value={current.remarks}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          className="block w-full p-2 border border-slate-200 rounded-lg text-xs max-w-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Submit Action */}
          <div className="px-6 flex justify-end">
            <button
              onClick={saveAttendance}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/15 transition-all active:scale-98"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Attendance Sheet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
