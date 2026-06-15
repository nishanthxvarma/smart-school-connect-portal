'use client';

import React, { useEffect, useState } from 'react';
import { 
  Award, Loader2, AlertCircle
} from 'lucide-react';

interface MarkItem {
  id: string;
  subject: string;
  examName: string;
  score: number;
  maxScore: number;
  remarks: string | null;
  gradedBy: { user: { name: string } };
}

export default function StudentMarksPage() {
  const [marks, setMarks] = useState<MarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarks() {
      try {
        const res = await fetch('/api/marks');
        if (res.ok) {
          const data = await res.json();
          setMarks(data);
        } else {
          setError('Failed to fetch academic grades.');
        }
      } catch (err) {
        setError('Connection failure.');
      } finally {
        setLoading(false);
      }
    }
    fetchMarks();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Award className="w-6 h-6 text-blue-600" />
          My Grade Card
        </h2>
        <p className="text-sm text-slate-500">View your marks scorecard and remarks from subject teachers</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Loading grades...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-rose-800">Connection Failed</h2>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
      ) : marks.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No grade entries recorded yet.
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-100">
                  <th className="p-4">Subject</th>
                  <th className="p-4">Exam / Test</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Remarks</th>
                  <th className="p-4">Graded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {marks.map((mark) => (
                  <tr key={mark.id} className="hover:bg-slate-55/10">
                    <td className="p-4 font-bold text-slate-700">{mark.subject}</td>
                    <td className="p-4 font-semibold text-slate-500">{mark.examName}</td>
                    <td className="p-4 font-extrabold text-slate-800">
                      <span className={`px-2.5 py-1 rounded-lg ${
                        (mark.score / mark.maxScore) >= 0.75 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : (mark.score / mark.maxScore) >= 0.40 
                          ? 'bg-amber-50 text-amber-700' 
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {mark.score} / {mark.maxScore}
                      </span>
                    </td>
                    <td className="p-4 italic text-slate-400 font-medium">{mark.remarks || '-'}</td>
                    <td className="p-4 font-medium text-slate-600">{mark.gradedBy.user.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
