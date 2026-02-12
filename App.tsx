
import React, { useState, useEffect } from 'react';
import { Calendar as CalIcon, List, Plus, PhoneCall, TrendingUp, Users, ShieldCheck, Zap } from 'lucide-react';
import CalendarView from './components/CalendarView';
import BookingModal from './components/BookingModal';
import { Booking, ViewMode } from './types';
import { analyzeLead } from './services/geminiService';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bookings');
    if (saved) {
      setBookings(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);

  const handleAddBooking = async (newBookingData: Partial<Booking>) => {
    const newBooking: Booking = {
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      customerName: newBookingData.customerName || '',
      phone: newBookingData.phone || '',
      email: newBookingData.email || '',
      date: newBookingData.date || new Date().toISOString().split('T')[0],
      time: newBookingData.time || '09:00',
      representative: newBookingData.representative || 'Niclas',
      notes: newBookingData.notes || '',
    };

    setBookings(prev => [newBooking, ...prev]);
    
    // Auto-analyze lead quality using Gemini
    if (newBooking.notes) {
      setActiveAnalysisId(newBooking.id);
      const analysis = await analyzeLead(newBooking);
      setBookings(prev => prev.map(b => 
        b.id === newBooking.id 
          ? { ...b, aiSummary: analysis.summary, leadQuality: analysis.quality } 
          : b
      ));
      setActiveAnalysisId(null);
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-rose-100 text-rose-700';
      default: return 'bg-amber-100 text-amber-700';
    }
  };

  const getQualityBadge = (quality: Booking['leadQuality']) => {
    switch (quality) {
      case 'Het': return 'bg-rose-600 text-white ring-rose-200';
      case 'Varm': return 'bg-orange-500 text-white ring-orange-100';
      default: return 'bg-slate-500 text-white ring-slate-100';
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });

  const nextCalls = sortedBookings.filter(b => b.status === 'pending');

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop Only Navigation */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col shrink-0 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <PhoneCall className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">BokaSmidigt</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
              viewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CalIcon size={20} /> Kalender
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
              viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <List size={20} /> Alla Bokningar
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Handläggare aktiva</p>
            <div className="flex -space-x-2">
              <div title="Niclas" className="w-8 h-8 rounded-full bg-blue-500 border-2 border-slate-900 flex items-center justify-center text-xs font-bold">N</div>
              <div title="Johan" className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-xs font-bold">J</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 max-w-[1600px] mx-auto w-full">
        {/* Header Area */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Dashboard</h2>
            <p className="text-slate-500">Välkommen tillbaka. Här är era kommande säljsamtal.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus size={20} /> Ny Bokning
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Inplanerade Samtal</p>
              <p className="text-2xl font-bold text-slate-900">{nextCalls.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Heta Prospekt</p>
              <p className="text-2xl font-bold text-slate-900">{bookings.filter(b => b.leadQuality === 'Het').length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Genomförda Samtal</p>
              <p className="text-2xl font-bold text-slate-900">{bookings.filter(b => b.status === 'completed').length}</p>
            </div>
          </div>
        </div>

        {/* View Selection (Mobile Tabs) */}
        <div className="flex md:hidden bg-slate-200 p-1 rounded-lg mb-6">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}
          >
            Kalender
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}
          >
            Lista
          </button>
        </div>

        {/* Dynamic Viewport */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {viewMode === 'calendar' ? (
              <CalendarView
                currentDate={currentCalendarDate}
                bookings={bookings}
                onDateClick={(date) => {
                  setSelectedDate(date);
                  setIsModalOpen(true);
                }}
                onPrevMonth={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1))}
                onNextMonth={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1))}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kund</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tid & Datum</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Handläggare</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kvalitet</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedBookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{booking.customerName}</div>
                            <div className="text-xs text-slate-500">{booking.phone}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {booking.date} kl {booking.time}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <span className={booking.representative === 'Niclas' ? 'text-blue-600' : 'text-emerald-600'}>
                              {booking.representative}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {booking.leadQuality ? (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ring-2 ring-offset-1 ${getQualityBadge(booking.leadQuality)}`}>
                                {booking.leadQuality}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                              {booking.status === 'pending' ? 'Inplanerad' : booking.status === 'completed' ? 'Klar' : 'Avbokad'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Next Up & AI Insights */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Zap size={20} className="text-amber-500" /> AI Insikter & Analys
              </h3>
              <div className="space-y-4">
                {nextCalls.slice(0, 3).map(call => (
                  <div key={call.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">{call.customerName}</span>
                      {call.leadQuality && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getQualityBadge(call.leadQuality)}`}>
                          {call.leadQuality}
                        </span>
                      )}
                    </div>
                    {activeAnalysisId === call.id ? (
                      <div className="flex items-center gap-2 text-sm text-indigo-600 animate-pulse">
                        <Zap size={14} className="animate-spin" /> Analyserar prospekt...
                      </div>
                    ) : call.aiSummary ? (
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{call.aiSummary}"
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">Ingen analys tillgänglig ännu.</p>
                    )}
                  </div>
                ))}
                {nextCalls.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-sm italic">
                    Inga inplanerade samtal att analysera.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-indigo-900 p-6 rounded-2xl text-white shadow-xl shadow-indigo-100">
              <ShieldCheck className="mb-4 text-indigo-300" size={32} />
              <h3 className="text-lg font-bold mb-2">Effektiv Uppföljning</h3>
              <p className="text-indigo-200 text-sm leading-relaxed mb-4">
                Säkerställ att Niclas och Johan alltid har rätt kontext inför varje samtal genom att använda AI-sammanfattningen.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 bg-white/10 p-2 rounded-lg">
                <TrendingUp size={14} /> Ökar konverteringen med 25%
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Mobile Nav */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around z-40">
        <button onClick={() => setViewMode('calendar')} className={`flex flex-col items-center p-2 ${viewMode === 'calendar' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <CalIcon size={20} />
          <span className="text-[10px] font-bold mt-1">Kalender</span>
        </button>
        <button onClick={() => setIsModalOpen(true)} className="flex flex-col items-center p-2 text-indigo-600 -mt-6 bg-white rounded-full border border-slate-200 shadow-lg w-14 h-14 justify-center">
          <Plus size={24} />
        </button>
        <button onClick={() => setViewMode('list')} className={`flex flex-col items-center p-2 ${viewMode === 'list' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <List size={20} />
          <span className="text-[10px] font-bold mt-1">Bokningar</span>
        </button>
      </footer>

      {/* Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddBooking}
        initialDate={selectedDate}
      />
    </div>
  );
};

export default App;
