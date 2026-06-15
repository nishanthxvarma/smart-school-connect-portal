'use client';

import React, { useEffect, useState } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, Loader2, 
  AlertCircle, Trash2, Clock, MapPin, AlignLeft
} from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendar dates state
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 15)); // Default to June 2026 for consistency with seed date
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      } else {
        setError('Failed to retrieve events.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const openAddModal = (date?: Date) => {
    setTitle('');
    setDescription('');
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      setEventDate(`${year}-${month}-${day}T09:00`);
    } else {
      setEventDate('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!title || !description || !eventDate) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, date: new Date(eventDate) })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchEvents();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to schedule event.');
      }
    } catch (err) {
      setError('Error connecting to backend.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEvents();
      } else {
        alert('Failed to delete event.');
      }
    } catch (err) {
      alert('Connection error.');
    }
  };

  // Monthly dates computation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayIndex }, (_, i) => i);

  const getEventsForDay = (dayNum: number) => {
    return events.filter(ev => {
      const d = new Date(ev.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === dayNum;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">School Calendar</h2>
          <p className="text-sm text-slate-500">Plan events, schedule parent-teacher PTM meetings, and declare holidays</p>
        </div>
        <button 
          onClick={() => openAddModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/15 active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Generating interactive calendar...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Month Grid */}
          <div className="lg:col-span-3 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
            {/* Nav Header */}
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handlePrevMonth} 
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleNextMonth} 
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-[10px] font-bold text-slate-400 uppercase py-1">{d}</div>
              ))}

              {/* Blanks */}
              {blanksArray.map(b => (
                <div key={`blank-${b}`} className="min-h-16 bg-slate-50/50 border border-slate-100/50 rounded-lg" />
              ))}

              {/* Day cells */}
              {daysArray.map(dayNum => {
                const dayEvents = getEventsForDay(dayNum);
                return (
                  <div 
                    key={`day-${dayNum}`}
                    className="min-h-16 p-1 border border-slate-100 bg-white hover:bg-blue-50/30 rounded-lg flex flex-col items-start gap-1 transition-all group relative cursor-pointer"
                    onClick={() => openAddModal(new Date(year, month, dayNum))}
                  >
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100/80 px-1.5 py-0.5 rounded-md group-hover:bg-blue-100/60 transition-all">
                      {dayNum}
                    </span>
                    <div className="flex-1 w-full overflow-hidden flex flex-col gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 2).map(ev => (
                        <div 
                          key={ev.id}
                          className="bg-blue-500 text-white text-[8px] font-semibold px-1 py-0.5 rounded leading-tight truncate w-full"
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[7px] text-slate-400 font-bold pl-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event Listing panel */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4 flex flex-col">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
              Scheduled Events ({events.length})
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[50vh] lg:max-h-[65vh]">
              {events.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-10">No events scheduled.</div>
              ) : (
                events.map(ev => (
                  <div key={ev.id} className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all space-y-2 relative group">
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all p-1"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <h4 className="text-xs font-bold text-slate-800 pr-5 truncate">{ev.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{ev.description}</p>
                    
                    <div className="flex items-center gap-1 text-[9px] text-blue-600 font-semibold pt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ev.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-scale-up">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Schedule Event</h3>
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
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sports Day, Science Fair, Exams"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="block w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Description / Venue details</label>
                <textarea
                  required
                  placeholder="Provide timing details, guidelines, or instructions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
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
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
