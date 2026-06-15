'use client';

import React, { useEffect, useState } from 'react';
import { 
  Bell, Loader2, AlertCircle, Calendar
} from 'lucide-react';

interface NoticeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  publishDate: string;
  createdBy: { name: string };
}

export default function ParentNoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotices() {
      try {
        const res = await fetch('/api/notices');
        if (res.ok) {
          const data = await res.json();
          setNotices(data);
        } else {
          setError('Failed to fetch announcements.');
        }
      } catch (err) {
        setError('Connection failure.');
      } finally {
        setLoading(false);
      }
    }
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
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">School Notice Board</h2>
        <p className="text-sm text-slate-500">Official circulars, exam datesheets, and holiday schedules</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Reading notices...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-rose-800">Connection Failed</h2>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No notices posted on the board.
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div 
              key={notice.id} 
              className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-md ${getCategoryColor(notice.category)}`}>
                    {notice.category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-400 text-[10px] flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(notice.publishDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-800 text-sm">{notice.title}</h3>
                <p className="text-slate-500 font-medium text-xs leading-relaxed whitespace-pre-line">{notice.content}</p>
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Source: {notice.createdBy.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
