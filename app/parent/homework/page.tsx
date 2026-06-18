'use client';

import React, { useEffect, useState } from 'react';
import { 
  ClipboardList, Loader2, AlertCircle, Calendar, Eye
} from 'lucide-react';

interface HomeworkItem {
  id: string;
  subject: string;
  description: string;
  dueDate: string;
  resourceUrl: string | null;
  class: { name: string };
  createdBy: { user: { name: string } };
}

interface ChildItem {
  studentId: string;
  name: string;
}

export default function ParentHomeworkPage() {
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch children metadata
  useEffect(() => {
    async function fetchChildren() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          if (data.children && data.children.length > 0) {
            setChildren(data.children);
            setSelectedChildId(data.children[0].studentId);
          }
        }
      } catch (err) {
        console.error('Error fetching children list:', err);
      }
    }
    fetchChildren();
  }, []);

  // 2. Fetch homework when selectedChildId changes
  useEffect(() => {
    if (!selectedChildId) return;

    async function fetchHomework() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/homework?studentId=${selectedChildId}`);
        if (res.ok) {
          const data = await res.json();
          setHomeworks(data);
        } else {
          setError('Failed to retrieve homework assignments.');
        }
      } catch (err) {
        setError('Connection failure.');
      } finally {
        setLoading(false);
      }
    }
    fetchHomework();
  }, [selectedChildId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Child Homework Monitor</h2>
          <p className="text-sm text-slate-500">Track homework deadlines, subject topics, and instructions assigned to your child</p>
        </div>

        {/* Child Selection Tabs */}
        {children.length > 1 && (
          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0">
            {children.map((child) => (
              <button
                key={child.studentId}
                onClick={() => setSelectedChildId(child.studentId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  selectedChildId === child.studentId
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading assignments...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-rose-800">Connection Failed</h2>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
      ) : homeworks.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No homework assigned to your child.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {homeworks.map((hw) => (
            <div 
              key={hw.id} 
              className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {hw.class.name}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md truncate max-w-[120px]">
                    {hw.subject}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-800 text-xs">{hw.subject} Homework</h3>
                <p className="text-slate-500 font-medium text-xs leading-relaxed line-clamp-3">{hw.description}</p>
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Assigned by: {hw.createdBy.user.name}</p>
              </div>

              <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 text-slate-400 font-medium">
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
                    Resource Link
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
