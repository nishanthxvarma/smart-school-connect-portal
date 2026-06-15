'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, Bell, Loader2, AlertCircle, Trash2, Edit2, 
  Calendar, Info, HelpCircle
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

export default function TeacherNoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'HOLIDAY' | 'EXAMINATION' | 'PARENT_MEETING' | 'SCHOOL_EVENT' | 'EMERGENCY'>('HOLIDAY');
  const [content, setContent] = useState('');
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
    setCategory('HOLIDAY');
    setContent('');
    setIsPublished(true);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (notice: NoticeItem) => {
    setEditingNotice(notice);
    setTitle(notice.title);
    setCategory(notice.category);
    setContent(notice.content);
    setIsPublished(notice.isPublished);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!title || !category || !content) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    const payload = { title, category, content, isPublished };

    try {
      let res;
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
        setError(errData.error || 'Failed to submit notice.');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;

    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotices(prev => prev.filter(n => n.id !== id));
      } else {
        alert('Failed to delete notice.');
      }
    } catch (err) {
      alert('Connection error.');
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Notice Board Management</h2>
          <p className="text-sm text-slate-500">Draft, publish, and schedule school-wide announcements</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/15 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Notice
        </button>
      </div>

      {/* Notices List */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading bulletin board...</span>
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No notices posted yet. Click &quot;Create Notice&quot; to publish an announcement.
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
                  <span className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(notice.publishDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-800 text-sm">{notice.title}</h3>
                <p className="text-slate-500 font-medium text-xs leading-relaxed whitespace-pre-line">{notice.content}</p>
                <p className="text-[10px] text-slate-400 font-medium">Posted by: {notice.createdBy.name}</p>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2 shrink-0 justify-end md:justify-start">
                <button
                  onClick={() => openEditModal(notice)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(notice.id)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-scale-up">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingNotice ? 'Modify Announcement' : 'Post School Announcement'}
              </h3>
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
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Notice Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Remedial Classes during Vacation"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
                  >
                    <option value="HOLIDAY">Holiday Announcement</option>
                    <option value="EXAMINATION">Examination Schedule</option>
                    <option value="PARENT_MEETING">Parent Teacher Meeting</option>
                    <option value="SCHOOL_EVENT">School Event</option>
                    <option value="EMERGENCY">Emergency Notice</option>
                  </select>
                </div>
                <div className="flex items-center pt-5 pl-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    Publish Immediately
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Notice Content</label>
                <textarea
                  required
                  placeholder="Draft full announcement details..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
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
                  {editingNotice ? 'Save Updates' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
