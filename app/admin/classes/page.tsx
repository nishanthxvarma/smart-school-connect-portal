'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, Loader2, AlertCircle, Edit2, Trash2, BookOpen, UserCheck, 
  Users, CheckCircle2, ShieldCheck
} from 'lucide-react';

interface TeacherItem {
  id: string;
  employeeId: string;
  user: { name: string };
}

interface ClassItem {
  id: string;
  name: string;
  teacherId: string | null;
  teacher: TeacherItem | null;
  _count: { students: number };
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [teacherId, setTeacherId] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const classRes = await fetch('/api/classes');
      if (classRes.ok) {
        const classData = await classRes.json();
        setClasses(classData);
      } else {
        setError('Failed to fetch classes.');
      }

      const teacherRes = await fetch('/api/admin/users?role=TEACHER');
      if (teacherRes.ok) {
        const teacherData = await teacherRes.json();
        setTeachers(teacherData);
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setName('');
    setTeacherId('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!name) {
      setError('Class name is required.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, teacherId: teacherId || undefined })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to create class.');
      }
    } catch (err) {
      setError('Error connecting to backend.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Manage Classes</h2>
          <p className="text-sm text-slate-500">Configure academic classrooms and assign class teachers</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/15 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Class
        </button>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading classrooms...</span>
        </div>
      ) : error && classes.length === 0 ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-rose-800">Connection Failed</h2>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No classes registered yet. Click &quot;Create New Class&quot; to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls) => (
            <div 
              key={cls.id} 
              className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-sm">{cls.name}</h3>
                  </div>
                  <span className="text-[10px] bg-slate-150 text-slate-500 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    {cls._count.students} Students
                  </span>
                </div>

                <div className="border-t border-slate-50 pt-3 flex items-start gap-2 text-xs">
                  <UserCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-600">Class Teacher</p>
                    <p className="text-slate-500 font-medium mt-0.5">
                      {cls.teacher ? `${cls.teacher.user.name} (${cls.teacher.employeeId})` : 'Unassigned'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up border border-slate-100">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Create Academic Class</h3>
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
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10-A, Class 9-B"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Assign Class Teacher (Optional)</label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">Select a teacher...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.user.name} ({t.employeeId})</option>
                  ))}
                </select>
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
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
