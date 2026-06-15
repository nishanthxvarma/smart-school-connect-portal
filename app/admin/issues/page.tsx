'use client';

import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, Loader2, AlertCircle, Calendar, User, 
  Settings, CheckCircle, Clock, Search, HelpCircle
} from 'lucide-react';

interface IssueItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED';
  photoUrl: string | null;
  date: string;
  reporter: { name: string; role: string };
}

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      } else {
        setError('Failed to fetch infrastructure issues.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setIssues(prev =>
          prev.map(issue => (issue.id === id ? { ...issue, status: newStatus as any } : issue))
        );
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      alert('Connection error.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">SUBMITTED</span>;
      case 'UNDER_REVIEW':
        return <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">UNDER REVIEW</span>;
      case 'IN_PROGRESS':
        return <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3 text-emerald-500" />RESOLVED</span>;
      default:
        return null;
    }
  };

  const filteredIssues = issues.filter(issue => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchLower) ||
      issue.description.toLowerCase().includes(searchLower) ||
      issue.reporter.name.toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus ? issue.status === filterStatus : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Monitor Infrastructure Issues</h2>
        <p className="text-sm text-slate-500">Track, update, and resolve school facility repairs reported by students and parents</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by title, description, or reporter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-sm"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-xl bg-white text-slate-800 p-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none max-w-[200px]"
        >
          <option value="">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Issues Table/List */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Fetching complaint logs...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center max-w-xl mx-auto">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-rose-800">Connection Failed</h2>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No infrastructure reports found.
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-100">
                  <th className="p-4">Report Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Date Reported</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Manage Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-55/10">
                    <td className="p-4 max-w-sm">
                      <p className="font-bold text-slate-800">{issue.title}</p>
                      <p className="text-slate-500 mt-1 font-medium leading-relaxed">{issue.description}</p>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        {issue.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold">{issue.reporter.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                        {issue.reporter.role}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(issue.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">{getStatusBadge(issue.status)}</td>
                    <td className="p-4">
                      <div className="flex justify-center items-center">
                        {updatingId === issue.id ? (
                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        ) : (
                          <select
                            value={issue.status}
                            disabled={updatingId !== null}
                            onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                            className="border border-slate-200 rounded-lg bg-slate-50 text-slate-700 p-1.5 text-[11px] font-semibold focus:outline-none"
                          >
                            <option value="SUBMITTED">Mark Submitted</option>
                            <option value="UNDER_REVIEW">Mark Under Review</option>
                            <option value="IN_PROGRESS">Mark In Progress</option>
                            <option value="RESOLVED">Mark Resolved</option>
                          </select>
                        )}
                      </div>
                    </td>
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
