'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Loader2, AlertCircle, Search, 
  Calendar, ClipboardList, TrendingUp, HelpCircle
} from 'lucide-react';

interface ClassItem {
  id: string;
  name: string;
}

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<string>('attendance');
  const [classId, setClassId] = useState<string>('');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch('/api/classes');
        if (res.ok) {
          const classData = await res.json();
          setClasses(classData);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      }
    }
    fetchClasses();
  }, []);

  const runReport = async () => {
    setLoading(true);
    setError(null);
    setData([]);

    let url = `/api/reports?type=${reportType}`;
    if (classId && (reportType === 'attendance' || reportType === 'performance')) {
      url += `&classId=${classId}`;
    }

    try {
      const res = await fetch(url);
      if (res.ok) {
        const reportData = await res.json();
        setData(reportData);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to compile report.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (data.length === 0) return;

    // Get headers
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Header row
    csvRows.push(headers.join(','));

    // Data rows
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        const escaped = ('' + val).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Generate School Reports</h2>
        <p className="text-sm text-slate-500">Run audit logs, export statistics, and analyze database records</p>
      </div>

      {/* Report Setup Controls */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Report Configuration</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setData([]);
              }}
              className="block w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="attendance">Daily Student Attendance Logs</option>
              <option value="performance">Student Performance & Marks</option>
              <option value="feedback">PTM Appointments & Feedback</option>
              <option value="issues">Infrastructure Issue Resolution</option>
            </select>
          </div>

          {(reportType === 'attendance' || reportType === 'performance') && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Class Filter (Optional)</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="block w-full p-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={runReport}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Run Report
            </button>
            
            {data.length > 0 && (
              <button
                onClick={exportToCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Section */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Compiling logs from database...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-rose-800">Compilation Failed</h2>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No report run yet. Select your configuration and click &quot;Run Report&quot; to inspect logs.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Report Preview ({data.length} records)</h3>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto max-h-[50vh]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-100 sticky top-0 z-10">
                    {Object.keys(data[0]).map(header => (
                      <th key={header} className="p-3 bg-slate-50">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      {Object.keys(data[0]).map(header => (
                        <td key={header} className="p-3 max-w-xs truncate">{'' + row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
