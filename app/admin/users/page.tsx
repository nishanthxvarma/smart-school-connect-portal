'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Loader2, AlertCircle, ShieldAlert,
  User, Mail, Phone, BookOpen, MapPin, Hash, Check
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
}

interface ClassItem {
  id: string;
  name: string;
}

interface ParentItem {
  id: string;
  user: { name: string };
}

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<'TEACHER' | 'STUDENT' | 'PARENT'>('TEACHER');
  const [users, setUsers] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [parents, setParents] = useState<ParentItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Profile specific form states
  const [employeeId, setEmployeeId] = useState('');
  const [subjectSpecialty, setSubjectSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [classId, setClassId] = useState('');
  const [parentId, setParentId] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/users?role=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setError('Failed to fetch user accounts.');
      }
    } catch (err) {
      setError('Error connecting to API.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const classRes = await fetch('/api/classes');
      if (classRes.ok) {
        const classData = await classRes.json();
        setClasses(classData);
      }
      const parentRes = await fetch('/api/admin/users?role=PARENT');
      if (parentRes.ok) {
        const parentData = await parentRes.json();
        setParents(parentData);
      }
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setUsername('');
    setPassword('');
    setEmployeeId('');
    setSubjectSpecialty('');
    setPhone('');
    setAddress('');
    setRollNumber('');
    setClassId('');
    setParentId('');
    setIsModalOpen(true);
  };

  const openEditModal = (userRecord: any) => {
    setEditingUser(userRecord);
    const base = userRecord.user || userRecord;
    setName(base.name);
    setEmail(base.email);
    setUsername(base.username);
    setPassword(''); // leave blank unless changing

    if (activeTab === 'TEACHER') {
      setEmployeeId(userRecord.employeeId);
      setSubjectSpecialty(userRecord.subjectSpecialty);
      setPhone(userRecord.phone);
    } else if (activeTab === 'PARENT') {
      setPhone(userRecord.phone);
      setAddress(userRecord.address);
    } else if (activeTab === 'STUDENT') {
      setRollNumber(userRecord.rollNumber);
      setClassId(userRecord.classId);
      setParentId(userRecord.parentId || '');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const profileData: any = {};
    if (activeTab === 'TEACHER') {
      profileData.employeeId = employeeId;
      profileData.subjectSpecialty = subjectSpecialty;
      profileData.phone = phone;
    } else if (activeTab === 'PARENT') {
      profileData.phone = phone;
      profileData.address = address;
    } else if (activeTab === 'STUDENT') {
      profileData.rollNumber = rollNumber;
      profileData.classId = classId;
      profileData.parentId = parentId || undefined;
    }

    const payload = {
      name,
      email,
      username,
      password: password || undefined,
      role: activeTab,
      profileData
    };

    try {
      let res;
      if (editingUser) {
        // Update
        const userId = editingUser.user?.id || editingUser.id;
        res = await fetch(`/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create
        res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        fetchUsers();
        fetchMetadata(); // Refresh parent lists for student dropdowns
      } else {
        const errData = await res.json();
        setError(errData.error || 'Operation failed.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userRecord: any) => {
    const base = userRecord.user || userRecord;
    if (!confirm(`Are you sure you want to delete account: ${base.name}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${base.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Delete failed.');
      }
    } catch (err) {
      alert('Connection error.');
    }
  };

  const filteredUsers = users.filter((record) => {
    const base = record.user || record;
    const searchLower = searchTerm.toLowerCase();
    return (
      base.name.toLowerCase().includes(searchLower) ||
      base.email.toLowerCase().includes(searchLower) ||
      base.username.toLowerCase().includes(searchLower) ||
      (record.rollNumber && record.rollNumber.toLowerCase().includes(searchLower)) ||
      (record.employeeId && record.employeeId.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Manage Accounts</h2>
          <p className="text-sm text-slate-500">Add, edit, or remove Teacher, Student, and Parent logins</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/15 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New {activeTab === 'TEACHER' ? 'Teacher' : activeTab === 'PARENT' ? 'Parent' : 'Student'}
        </button>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-slate-200 gap-6">
        {(['TEACHER', 'STUDENT', 'PARENT'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSearchTerm('');
            }}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'TEACHER' ? 'Teachers' : tab === 'STUDENT' ? 'Students' : 'Parents'}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder={`Search ${activeTab.toLowerCase()}s by name, email, or ID...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all text-sm"
        />
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Retrieving records...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No records match the current search or filters.
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-100">
                  <th className="p-4">Name / Username</th>
                  <th className="p-4">Email</th>
                  {activeTab === 'TEACHER' && <th className="p-4">Employee ID</th>}
                  {activeTab === 'TEACHER' && <th className="p-4">Specialty</th>}
                  {activeTab === 'STUDENT' && <th className="p-4">Roll Number</th>}
                  {activeTab === 'STUDENT' && <th className="p-4">Class</th>}
                  {activeTab === 'STUDENT' && <th className="p-4">Parent</th>}
                  {activeTab === 'PARENT' && <th className="p-4">Phone</th>}
                  {activeTab === 'PARENT' && <th className="p-4">Address</th>}
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((record) => {
                  const base = record.user || record;
                  return (
                    <tr key={record.id} className="hover:bg-slate-55/10">
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{base.name}</p>
                        <p className="text-[10px] text-slate-400">@{base.username}</p>
                      </td>
                      <td className="p-4 font-medium">{base.email}</td>
                      
                      {activeTab === 'TEACHER' && <td className="p-4 font-mono font-bold text-blue-600">{record.employeeId}</td>}
                      {activeTab === 'TEACHER' && <td className="p-4">{record.subjectSpecialty}</td>}
                      
                      {activeTab === 'STUDENT' && <td className="p-4 font-mono font-bold text-amber-600">{record.rollNumber}</td>}
                      {activeTab === 'STUDENT' && <td className="p-4 font-semibold">{record.class?.name || 'Unassigned'}</td>}
                      {activeTab === 'STUDENT' && <td className="p-4">{record.parent?.user?.name || '-'}</td>}
                      
                      {activeTab === 'PARENT' && <td className="p-4">{record.phone}</td>}
                      {activeTab === 'PARENT' && <td className="p-4 max-w-xs truncate">{record.address}</td>}

                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(record)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
                            title="Edit Account"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(record)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-up border border-slate-100">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingUser ? 'Modify Account Details' : `Register New ${activeTab === 'TEACHER' ? 'Teacher' : activeTab === 'PARENT' ? 'Parent' : 'Student'}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            
            {error && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs font-semibold rounded-r-lg flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smt. Lakshmi Devi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@school.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. lakshmid"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Password {editingUser && '(Leave empty to keep current)'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Profile Specific Information</h4>

                {activeTab === 'TEACHER' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Employee ID</label>
                        <input
                          type="text"
                          required
                          placeholder="TCH-2026-003"
                          value={employeeId}
                          onChange={(e) => setEmployeeId(e.target.value)}
                          className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Contact Phone</label>
                        <input
                          type="text"
                          required
                          placeholder="+91 9999999999"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Subject Specialty</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Science / Physics"
                        value={subjectSpecialty}
                        onChange={(e) => setSubjectSpecialty(e.target.value)}
                        className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'PARENT' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Mobile Phone</label>
                      <input
                        type="text"
                        required
                        placeholder="+91 8888888888"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Residential Address</label>
                      <textarea
                        required
                        placeholder="Full physical address..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={2}
                        className="block w-full p-2 border border-slate-200 rounded-lg text-xs resize-none"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'STUDENT' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Roll Number</label>
                        <input
                          type="text"
                          required
                          placeholder="ROLL-10A-05"
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Assign Class</label>
                        <select
                          required
                          value={classId}
                          onChange={(e) => setClassId(e.target.value)}
                          className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="">Select a class...</option>
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Link Parent Account</label>
                      <select
                        value={parentId}
                        onChange={(e) => setParentId(e.target.value)}
                        className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="">No parent linked...</option>
                        {parents.map(p => (
                          <option key={p.id} value={p.id}>{p.user.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
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
                  {editingUser ? 'Save Updates' : 'Register Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
