'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, BookOpen, Loader2, AlertCircle, Trash2, 
  Eye, FileText, Video, Library
} from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
}

interface ResourceItem {
  id: string;
  title: string;
  category: 'NOTES' | 'PDF' | 'YOUTUBE' | 'WORKSHEET' | 'STUDY_MATERIAL';
  fileUrl: string | null;
  subject: string;
  class: { name: string };
  createdAt: string;
}

export default function TeacherResourcesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'NOTES' | 'PDF' | 'YOUTUBE' | 'WORKSHEET' | 'STUDY_MATERIAL'>('NOTES');
  const [fileUrl, setFileUrl] = useState('');
  const [classId, setClassId] = useState('');
  const [subject, setSubject] = useState('');

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

      const resList = await fetch('/api/resources');
      if (resList.ok) {
        const resData = await resList.json();
        setResources(resData);
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
    setTitle('');
    setCategory('NOTES');
    setFileUrl('');
    setSubject('');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!title || !category || !classId || !subject) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          fileUrl: fileUrl || undefined,
          classId,
          subject
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to upload resource.');
      }
    } catch (err) {
      setError('Error connecting to backend.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResources(prev => prev.filter(r => r.id !== id));
      } else {
        alert('Failed to delete resource.');
      }
    } catch (err) {
      alert('Connection error.');
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'NOTES':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><FileText className="w-3 h-3" />NOTES</span>;
      case 'PDF':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><FileText className="w-3 h-3" />PDF DOCUMENT</span>;
      case 'YOUTUBE':
        return <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Video className="w-3 h-3" />VIDEO LECTURE</span>;
      case 'WORKSHEET':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><ClipboardListIcon className="w-3 h-3" />WORKSHEET</span>;
      default:
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><Library className="w-3 h-3" />STUDY GUIDE</span>;
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
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Learning Resources</h2>
          <p className="text-sm text-slate-500">Upload study materials, notes, YouTube references, and worksheets</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/15 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Resource
        </button>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading resources...</span>
        </div>
      ) : error && resources.length === 0 ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-rose-800">Connection Failed</h2>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No resources uploaded yet. Click &quot;Add Resource&quot; to post materials.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((res) => (
            <div 
              key={res.id} 
              className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              <button
                onClick={() => handleDelete(res.id)}
                className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all p-1"
                title="Delete Resource"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="space-y-2.5">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {res.class.name}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                    {res.subject}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-800 text-xs pr-6 truncate">{res.title}</h3>
                <div className="pt-1">{getCategoryBadge(res.category)}</div>
              </div>

              <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">Uploaded: {new Date(res.createdAt).toLocaleDateString()}</span>
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

      {/* Add Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-scale-up">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Upload Learning Resource</h3>
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
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Arithmetic Progression Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Target Class</label>
                  <select
                    required
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">Select class...</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
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
                    <option value="NOTES">Handwritten Notes</option>
                    <option value="PDF">PDF Textbook/Document</option>
                    <option value="YOUTUBE">YouTube Video Link</option>
                    <option value="WORKSHEET">Worksheet</option>
                    <option value="STUDY_MATERIAL">Reference Material</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Resource Link / File URL</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
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
                  Upload Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
