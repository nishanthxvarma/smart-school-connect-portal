'use client';

import React, { useEffect, useState } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Loader2, 
  AlertCircle, Clock
} from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
}

export default function TeacherCalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendar dates state
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 15)); // Default to June 2026

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
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">School Calendar</h2>
        <p className="text-sm text-slate-500">View upcoming school events, exams, holidays, and PTM schedules</p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-semibold">Generating calendar grid...</span>
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
                    className="min-h-16 p-1 border border-slate-100 bg-white rounded-lg flex flex-col items-start gap-1 group relative"
                  >
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100/80 px-1.5 py-0.5 rounded-md">
                      {dayNum}
                    </span>
                    <div className="flex-1 w-full overflow-hidden flex flex-col gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 2).map(ev => (
                        <div 
                          key={ev.id}
                          className="bg-blue-500 text-white text-[8px] font-semibold px-1 py-0.5 rounded leading-tight truncate w-full"
                          title={`${ev.title}: ${ev.description}`}
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
              All Scheduled Events ({events.length})
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[50vh] lg:max-h-[65vh]">
              {events.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-10">No events scheduled.</div>
              ) : (
                events.map(ev => (
                  <div key={ev.id} className="p-3 border border-slate-100 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{ev.title}</h4>
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
    </div>
  );
}
