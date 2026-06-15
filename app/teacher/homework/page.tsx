'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, ClipboardList, Loader2, AlertCircle, Calendar, BookOpen, 
  Trash2, Send, Save, Eye
} from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
}

interface HomeworkItem {
  id: string;
  subject: string;
  description: string;
  dueDate: string;
  resourceUrl: string | null;
  class: { name: string };
  createdAt: string;
}

export default function TeacherHomeworkPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [subject, setSubject] = useState('');
  const [classId, setClassId] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const classRes = await fetch('/api/classes');
      if (classRes.ok) {
        const classData = await classRes.json();
        setClasses(classData);
        if (classData.length > 0) setClassId(classData[0].id);
      }

      const hwRes = await fetch('/api/homework');
      if (hwRes.ok) {
        const hwData = await hwRes.json();
        setHomeworks(hwData);
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
    setSubject('');
    setDescription('');
    setDueDate('');
    setResourceUrl('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!subject || !classId || !description || !dueDate) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          classId,
          description,
          dueDate: new Date(dueDate),
          resourceUrl: resourceUrl || undefined
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to assign homework.');
      }
    } catch (err) {
      setError('Error connecting to backend.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this homework assignment?')) return;

    try {
      const res = await fetch(`/api/homework/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHomeworks(prev => prev.filter(hw => hw.id !== id));
      } else {
        alert('Failed to delete assignment.');
      }
    } catch (err) {
      alert('Connection error.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Homework Management</h2>
          <p className="text-sm text-slate-500">Upload assignments, select due dates, and distribute resource links</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/15 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          Assign Homework
        </button>
      </div>

      {/* Homework Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading assignments...</span>
        </div>
      ) : error && homeworks.length === 0 ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-rose-800">Connection Failed</h2>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
      ) : homeworks.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No homework assigned yet. Click &quot;Assign Homework&quot; to distribute tasks.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {homeworks.map((hw) => (
            <div 
              key={hw.id} 
              className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              <button
                onClick={() => handleDelete(hw.id)}
                className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all p-1"
                title="Delete Assignment"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {hw.class.name}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md truncate max-w-[120px]">
                    {hw.subject}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-800 text-xs pr-6">{hw.subject} Assignment</h3>
                <p className="text-slate-500 font-medium text-xs leading-relaxed line-clamp-3">{hw.description}</p>
              </div>

              <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                </div>
                {hw.resourceUrl && (
                  <a 
                    href={hw.resourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Resource
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Homework Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-scale-up">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Assign Homework</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            {error && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs font-semibold rounded-r-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Assign Class</label>
                  <select
                    required
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">Select a class...</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Attachment URL / Study Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                  className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Homework Description</label>
                <textarea
                  required
                  placeholder="Write assignment instructions, question numbers, or syllabus chapters..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  Assign Homework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
