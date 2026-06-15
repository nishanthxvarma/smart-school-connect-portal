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

export default function StudentHomeworkPage() {
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHomework() {
      try {
        const res = await fetch('/api/homework');
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
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">My Class Homework</h2>
        <p className="text-sm text-slate-500">View and complete homework assignments allocated by your teachers</p>
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
          No homework assigned to your class.
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
