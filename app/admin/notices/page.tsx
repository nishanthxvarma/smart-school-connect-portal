'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, Bell, Loader2, AlertCircle, Trash2, Edit2, 
  Calendar, X, CheckCircle, HelpCircle
} from 'lucide-react';

interface NoticeItem {
  id: string;
  title: string;
  content: string;
  category: 'HOLIDAY' | 'EXAMINATION' | 'PARENT_MEETING' | 'SCHOOL_EVENT' | 'EMERGENCY';
  publishDate: string;
  isPublished: boolean;
  createdBy: { name: string };
  createdAt: string;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'HOLIDAY' | 'EXAMINATION' | 'PARENT_MEETING' | 'SCHOOL_EVENT' | 'EMERGENCY'>('SCHOOL_EVENT');
  const [isPublished, setIsPublished] = useState(true);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/notices');
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      } else {
        setError('Failed to fetch notices.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const openAddModal = () => {
    setEditingNotice(null);
    setTitle('');
    setContent('');
    setCategory('SCHOOL_EVENT');
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (notice: NoticeItem) => {
    setEditingNotice(notice);
    setTitle(notice.title);
    setContent(notice.content);
    setCategory(notice.category);
    setIsPublished(notice.isPublished);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchNotices();
      } else {
        alert('Failed to delete notice.');
      }
    } catch (err) {
      alert('Error connecting to backend.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!title || !content) {
      setError('Title and Content are required.');
      setSubmitting(false);
      return;
    }

    try {
      let res;
      const payload = { title, content, category, isPublished };
      if (editingNotice) {
        res = await fetch(`/api/notices/${editingNotice.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/notices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        fetchNotices();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to save notice.');
      }
    } catch (err) {
      setError('Error connecting to backend.');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'HOLIDAY': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'EXAMINATION': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PARENT_MEETING': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SCHOOL_EVENT': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'EMERGENCY': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-sans">Notice Board</h2>
          <p className="text-sm text-slate-500 font-medium">Publish, edit, and manage school-wide announcements</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/15 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          Publish Notice
        </button>
      </div>

      {/* Notices List */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading bulletin board...</span>
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm font-semibold">
          No notices posted yet. Click &quot;Publish Notice&quot; to broadcast.
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div 
              key={notice.id} 
              className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between gap-4 relative group"
            >
              <div className="space-y-2.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-md ${getCategoryColor(notice.category)}`}>
                    {notice.category.replace(/_/g, ' ')}
                  </span>
                  {!notice.isPublished && (
                    <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      DRAFT
                    </span>
                  )}
                  <span className="text-slate-400 text-[10px] flex items-center gap-1 font-semibold">
                    <Calendar className="w-3 h-3" />
                    {new Date(notice.publishDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-800 text-sm font-sans">{notice.title}</h3>
                <p className="text-slate-600 font-medium text-xs leading-relaxed whitespace-pre-line">{notice.content}</p>
                <p className="text-[10px] text-slate-400 font-semibold">Posted by: {notice.createdBy.name}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col justify-end items-center gap-2 border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                <button
                  onClick={() => openEditModal(notice)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Edit Notice"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(notice.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  title="Delete Notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold font-sans">{editingNotice ? 'Edit Notice Details' : 'Publish New Notice'}</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs font-semibold rounded-r-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day School Closure"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full p-2.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="block w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="SCHOOL_EVENT">School Event</option>
                    <option value="HOLIDAY">Holiday</option>
                    <option value="EXAMINATION">Examination</option>
                    <option value="PARENT_MEETING">Parent Meeting</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Publish Status</label>
                  <select
                    value={isPublished ? 'true' : 'false'}
                    onChange={(e) => setIsPublished(e.target.value === 'true')}
                    className="block w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="true">Publish Immediately</option>
                    <option value="false">Save as Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Notice Content</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Write notice description, instructions or detailed info here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="block w-full p-2.5 border border-slate-200 rounded-lg text-xs resize-none"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10 active:scale-95 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
                  {editingNotice ? 'Update Notice' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
