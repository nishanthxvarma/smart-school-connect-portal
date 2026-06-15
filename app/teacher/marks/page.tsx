'use client';

import React, { useEffect, useState } from 'react';
import { 
  FileText, Plus, Search, Loader2, AlertCircle, Edit2, 
  Trash2, Award, ClipboardList, CheckCircle2
} from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
}

interface StudentItem {
  id: string;
  rollNumber: string;
  user: { name: string };
}

interface MarkItem {
  id: string;
  subject: string;
  examName: string;
  score: number;
  maxScore: number;
  remarks: string | null;
  student: { rollNumber: string; user: { name: string } };
}

export default function TeacherMarksPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [marks, setMarks] = useState<MarkItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMark, setEditingMark] = useState<MarkItem | null>(null);

  // Form states
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('');
  const [examName, setExamName] = useState('');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [remarks, setRemarks] = useState('');

  const fetchClassesAndMarks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const classRes = await fetch('/api/classes');
      if (classRes.ok) {
        const classData = await classRes.json();
        setClasses(classData);
        if (classData.length > 0) {
          setSelectedClass(classData[0].id);
        }
      }

      const marksRes = await fetch('/api/marks');
      if (marksRes.ok) {
        const marksData = await marksRes.json();
        setMarks(marksData);
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassesAndMarks();
  }, []);

  // Fetch students when class changes
  useEffect(() => {
    if (!selectedClass) return;

    async function loadStudents() {
      try {
        const studentRes = await fetch(`/api/admin/users?role=STUDENT`);
        if (studentRes.ok) {
          const allStudents = await studentRes.json();
          const classStudents = allStudents.filter((s: any) => s.classId === selectedClass);
          setStudents(classStudents);
        }
      } catch (err) {
        console.error('Failed to load students', err);
      }
    }
    loadStudents();
  }, [selectedClass]);

  const openAddModal = () => {
    setEditingMark(null);
    setStudentId('');
    setSubject('');
    setExamName('');
    setScore('');
    setMaxScore('100');
    setRemarks('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (markRecord: MarkItem) => {
    setEditingMark(markRecord);
    setStudentId(markRecord.student.rollNumber); // just to show, though we disable student change
    setSubject(markRecord.subject);
    setExamName(markRecord.examName);
    setScore(String(markRecord.score));
    setMaxScore(String(markRecord.maxScore));
    setRemarks(markRecord.remarks || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      studentId: editingMark ? undefined : studentId,
      subject,
      examName,
      score,
      maxScore,
      remarks
    };

    try {
      let res;
      if (editingMark) {
        res = await fetch(`/api/marks/${editingMark.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/marks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        // Refresh marks
        const marksRes = await fetch('/api/marks');
        if (marksRes.ok) {
          const marksData = await marksRes.json();
          setMarks(marksData);
        }
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to submit grade.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mark record?')) return;

    try {
      const res = await fetch(`/api/marks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMarks(prev => prev.filter(m => m.id !== id));
      } else {
        alert('Delete failed.');
      }
    } catch (err) {
      alert('Connection error.');
    }
  };

  // Filter marks by selected class
  const filteredMarks = marks.filter((mark) => {
    if (!selectedClass) return true;
    // Find student class
    const studentInClass = students.find(s => s.id === (mark as any).studentId);
    return selectedClass ? (mark as any).student?.classId === selectedClass || studentInClass !== undefined : true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Student Progress Tracking</h2>
          <p className="text-sm text-slate-500">Record scores, manage exam grades, and add teacher remarks</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/15 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          Enter Test Score
        </button>
      </div>

      {/* Class Selector Filter */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm max-w-sm">
        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Filter by Class</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="block w-full p-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
        >
          <option value="">All Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Marks Table */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Fetching grade cards...</span>
        </div>
      ) : filteredMarks.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No grade records found for the selected class. Click &quot;Enter Test Score&quot; to grade students.
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-100">
                  <th className="p-4">Student</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Exam/Test</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Teacher Remarks</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredMarks.map((mark) => (
                  <tr key={mark.id} className="hover:bg-slate-55/10">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{mark.student.user.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{mark.student.rollNumber}</p>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">{mark.subject}</td>
                    <td className="p-4 font-medium text-slate-600">{mark.examName}</td>
                    <td className="p-4 font-bold text-slate-800">
                      <span className={`px-2 py-1 rounded-lg ${
                        (mark.score / mark.maxScore) >= 0.75 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : (mark.score / mark.maxScore) >= 0.40 
                          ? 'bg-amber-50 text-amber-700' 
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {mark.score} / {mark.maxScore}
                      </span>
                    </td>
                    <td className="p-4 italic text-slate-500 max-w-xs truncate">{mark.remarks || '-'}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(mark)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
                          title="Edit Grade"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(mark.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all"
                          title="Delete Grade"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grade Enter Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-scale-up">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingMark ? 'Edit Grade Record' : 'Enter Student Test Score'}
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
              {!editingMark && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Select Student</label>
                  <select
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">Select student...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.user.name} ({s.rollNumber})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Exam / Test Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unit Test I"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Score Obtained</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="e.g. 85.5"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Maximum Score</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Teacher remarks / remarks</label>
                <textarea
                  placeholder="e.g. Strong logical deduction, improve handwriting..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
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
                  {editingMark ? 'Save Updates' : 'Sync Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
