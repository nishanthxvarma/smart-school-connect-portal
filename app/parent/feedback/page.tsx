'use client';

import React, { useEffect, useState } from 'react';
import { 
  Award, Plus, Loader2, AlertCircle, Calendar, 
  CheckCircle, MessageSquare, Save
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  date: string;
}

export default function ParentFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('OTHER'); // Map feedback categories into Complaint schema

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const data = await res.json();
        // Feedback is complaints that have categories like academic/hygiene which are mapped or generic
        setFeedbacks(data);
      } else {
        setError('Failed to fetch feedback logs.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const openAddModal = () => {
    setTitle('');
    setDescription('');
    setCategory('OTHER');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!title || !description) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `[Feedback: ${category}] ${title}`,
          description,
          category: 'OTHER', // store under OTHER category in complaints
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchFeedbacks();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      setError('Error connecting to school server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-600" />
            Parent Feedback & Suggestions
          </h2>
          <p className="text-sm text-slate-500">Share suggestions, lodge academic/transport complaints, and request reviews</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/15 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          Submit Feedback
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Retrieving your submissions...</span>
        </div>
      ) : error && feedbacks.length === 0 ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-rose-800">Connection Failed</h2>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No feedback entries recorded. Click &quot;Submit Feedback&quot; to share your views.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {feedbacks.map((item) => (
            <div 
              key={item.id} 
              className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    FEEDBACK
                  </span>
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                    {item.status}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-800 text-xs truncate">{item.title}</h3>
                <p className="text-slate-500 font-medium text-xs leading-relaxed line-clamp-3">{item.description}</p>
              </div>

              <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Submitted: {new Date(item.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Feedback Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-scale-up">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Submit Suggestions / Feedback</h3>
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
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Subject / title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Request for cleaner drinking water station"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Feedback Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
                >
                  <option value="ACADEMIC">Academic syllabus & class quality</option>
                  <option value="INFRASTRUCTURE">School Infrastructure & rooms</option>
                  <option value="TRANSPORT">School Transport / Bus facilities</option>
                  <option value="HYGIENE">Hygiene & Washroom cleanliness</option>
                  <option value="OTHER">Other general suggestions</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Detailed Description</label>
                <textarea
                  required
                  placeholder="Explain your suggestion, complaint or request in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
