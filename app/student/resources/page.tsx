'use client';

import React, { useEffect, useState } from 'react';
import { 
  BookOpen, Loader2, AlertCircle, Eye, FileText, Video, Library
} from 'lucide-react';

interface ResourceItem {
  id: string;
  title: string;
  category: 'NOTES' | 'PDF' | 'YOUTUBE' | 'WORKSHEET' | 'STUDY_MATERIAL';
  fileUrl: string | null;
  subject: string;
  class: { name: string };
  createdAt: string;
}

export default function StudentResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResources() {
      try {
        const res = await fetch('/api/resources');
        if (res.ok) {
          const data = await res.json();
          setResources(data);
        } else {
          setError('Failed to fetch learning materials.');
        }
      } catch (err) {
        setError('Connection failure.');
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'NOTES':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><FileText className="w-3 h-3" />NOTES</span>;
      case 'PDF':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><FileText className="w-3 h-3" />PDF BOOK</span>;
      case 'YOUTUBE':
        return <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Video className="w-3 h-3" />VIDEO LECTURE</span>;
      case 'WORKSHEET':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><ClipboardListIcon className="w-3 h-3" />WORKSHEET</span>;
      default:
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Library className="w-3 h-3" />STUDY MATERIAL</span>;
    }
  };

  const ClipboardListIcon = (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Learning Resources</h2>
        <p className="text-sm text-slate-500">Access notes, handouts, lecture videos, and worksheets uploaded for your class</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading classroom items...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-rose-800">Connection Failed</h2>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No learning materials posted for your class yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((res) => (
            <div 
              key={res.id} 
              className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {res.class.name}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                    {res.subject}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-800 text-xs truncate">{res.title}</h3>
                <div className="pt-1">{getCategoryBadge(res.category)}</div>
              </div>

              <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Posted: {new Date(res.createdAt).toLocaleDateString()}</span>
                {res.fileUrl && (
                  <a 
                    href={res.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Open Resource
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
