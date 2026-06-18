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
  const [error, setError] = useState<string | null>(null);

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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Notice Board</h2>
          <p className="text-sm text-slate-500">View school-wide announcements and notifications</p>
        </div>
      </div>

      {/* Notices List */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading bulletin board...</span>
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No notices posted yet.
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
