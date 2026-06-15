'use client';

import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, Plus, Loader2, AlertCircle, Calendar, 
  CheckCircle, Clock, Save, FileText
} from 'lucide-react';

interface IssueItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED';
  photoUrl: string | null;
  date: string;
}

export default function ParentIssuesPage() {
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('BROKEN_BENCH');
  const [photoUrl, setPhotoUrl] = useState('');

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      } else {
        setError('Failed to fetch reported issues.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const openAddModal = () => {
    setTitle('');
    setDescription('');
    setCategory('BROKEN_BENCH');
    setPhotoUrl('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!title || !description || !category) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          photoUrl: photoUrl || undefined
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchIssues();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to submit issue report.');
      }
    } catch (err) {
      setError('Error connecting to school server.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-full">SUBMITTED</span>;
      case 'UNDER_REVIEW':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">UNDER REVIEW</span>;
      case 'IN_PROGRESS':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-250 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" />RESOLVED</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-blue-600" />
            Report School Infrastructure Issues
          </h2>
          <p className="text-sm text-slate-500">Submit facility repair requests and monitor their resolution workflow status</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/15 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          Report Issue
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading your issues...</span>
        </div>
      ) : error && issues.length === 0 ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-rose-800">Connection Failed</h2>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No issues reported by you. Click &quot;Report Issue&quot; if you spot damaged school infrastructure.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {issues.map((issue) => (
            <div 
              key={issue.id} 
              className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {issue.category.replace(/_/g, ' ')}
                  </span>
                  {getStatusBadge(issue.status)}
                </div>

                <h3 className="font-extrabold text-slate-800 text-xs truncate">{issue.title}</h3>
                <p className="text-slate-500 font-medium text-xs leading-relaxed line-clamp-3">{issue.description}</p>
              </div>

              <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Reported: {new Date(issue.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Issue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-scale-up">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Report Damaged Infrastructure</h3>
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
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken bench in Chemistry lab"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
                  >
                    <option value="BROKEN_BENCH">Broken Bench / Desk</option>
                    <option value="FAN_NOT_WORKING">Ceiling Fan Not Working</option>
                    <option value="WATER_PROBLEM">Drinking Water cooler problem</option>
                    <option value="WASHROOM_ISSUE">Washroom Plumbing issue</option>
                    <option value="ELECTRICAL_PROBLEM">Electrical wiring / Light problem</option>
                    <option value="PLAYGROUND_ISSUE">Playground Damage</option>
                    <option value="CLASSROOM_DAMAGE">Classroom walls/door damage</option>
                    <option value="OTHER">Other Issues</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Photo Link / Reference URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://imgur.com/... / image link"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Issue Description</label>
                <textarea
                  required
                  placeholder="Provide timing details, classroom numbers, or descriptions of the damage..."
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
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
