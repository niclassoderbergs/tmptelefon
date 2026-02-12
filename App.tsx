
import React, { useState, useEffect } from 'react';
import { Calendar as CalIcon, List, Plus, PhoneCall, TrendingUp, Users, ShieldCheck, Zap, Home, Search, Library } from 'lucide-react';
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

  useEffect(() => {
    const saved = localStorage.getItem('bookings');
    if (saved) setBookings(JSON.parse(saved));
  }, []);

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
      case 'completed': return 'text-[#1DB954]';
      case 'cancelled': return 'text-red-500';
      default: return 'text-amber-500';
    }
  };

  const getQualityBadge = (quality: Booking['leadQuality']) => {
    switch (quality) {
      case 'Het': return 'bg-[#1DB954] text-black font-bold';
      case 'Varm': return 'bg-white text-black font-bold';
      default: return 'bg-[#282828] text-[#b3b3b3]';
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });

  const nextCalls = sortedBookings.filter(b => b.status === 'pending');

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white selection:bg-[#1DB954]">
      {/* Sidebar - Spotify Style */}
      <aside className="hidden md:flex w-[240px] bg-black flex-col shrink-0 p-3 space-y-2">
        <div className="bg-[#121212] rounded-lg p-5 space-y-5">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center">
               <PhoneCall size={18} className="text-black" />
             </div>
             <h1 className="text-lg font-bold tracking-tight">BokaSmidigt</h1>
          </div>
          <nav className="space-y-4">
            <button onClick={() => setViewMode('calendar')} className={`flex items-center gap-4 w-full text-sm font-bold transition-colors ${viewMode === 'calendar' ? 'text-white' : 'text-[#b3b3b3] hover:text-white'}`}>
              <Home size={24} /> Hem
            </button>
            <button className="flex items-center gap-4 w-full text-sm font-bold text-[#b3b3b3] hover:text-white transition-colors">
              <Search size={24} /> Sök samtal
            </button>
          </nav>
        </div>

        <div className="flex-1 bg-[#121212] rounded-lg p-5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <button className="flex items-center gap-3 text-[#b3b3b3] hover:text-white transition-colors font-bold text-sm">
              <Library size={24} /> Mitt Bibliotek
            </button>
            <button onClick={() => setIsModalOpen(true)} className="p-1 hover:bg-[#282828] rounded-full text-[#b3b3b3] hover:text-white transition-all">
              <Plus size={24} />
            </button>
          </div>
          
          <div className="space-y-4 overflow-y-auto">
             <div 
               onClick={() => setViewMode('list')}
               className={`p-2 rounded-md cursor-pointer flex items-center gap-3 hover:bg-[#1a1a1a] transition-colors ${viewMode === 'list' ? 'bg-[#282828]' : ''}`}
             >
               <div className="w-12 h-12 bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-md flex items-center justify-center shadow-lg">
                 <List size={20} />
               </div>
               <div>
                 <p className="text-sm font-bold">Alla Bokningar</p>
                 <p className="text-xs text-[#b3b3b3]">Spellista • {bookings.length} st</p>
               </div>
             </div>
          </div>

          <div className="mt-auto pt-6 border-t border-[#282828]">
            <div className="bg-[#282828] p-4 rounded-lg">
              <p className="text-[10px] font-bold text-[#b3b3b3] uppercase tracking-wider mb-2">Aktiva ringer</p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#1DB954] border-2 border-[#121212] flex items-center justify-center text-[10px] font-black text-black">N</div>
                  <div className="w-8 h-8 rounded-full bg-[#1ed760] border-2 border-[#121212] flex items-center justify-center text-[10px] font-black text-black">J</div>
                </div>
                <span className="text-xs font-bold text-[#1DB954] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#1DB954] rounded-full animate-pulse" /> Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-[#1b1b1b] to-[#121212] m-2 rounded-lg overflow-y-auto pb-24 md:pb-10">
        <header className="p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-4">Dashboard</h2>
            <div className="flex items-center gap-2 text-sm font-bold text-[#b3b3b3]">
              <div className="w-6 h-6 bg-[#1DB954] rounded-full flex items-center justify-center text-black text-[10px]">BS</div>
              <span>BokaSmidigt</span>
              <span className="w-1 h-1 bg-[#b3b3b3] rounded-full" />
              <span>{nextCalls.length} kommande samtal</span>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center justify-center gap-2 bg-[#1DB954] text-black px-8 py-3 rounded-full font-black hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            NY BOKNING
          </button>
        </header>

        <div className="p-6 md:p-8 space-y-8">
          {/* Calendar or List View */}
          <section className="bg-black/20 rounded-xl overflow-hidden backdrop-blur-sm">
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
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#b3b3b3]">
                  <thead className="border-b border-[#282828]">
                    <tr>
                      <th className="px-6 py-4 font-normal">#</th>
                      <th className="px-6 py-4 font-normal">KUND</th>
                      <th className="px-6 py-4 font-normal">TID & DATUM</th>
                      <th className="px-6 py-4 font-normal">HANDLÄGGARE</th>
                      <th className="px-6 py-4 font-normal">KVALITET</th>
                      <th className="px-6 py-4 font-normal text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBookings.map((booking, idx) => (
                      <tr key={booking.id} className="group hover:bg-[#ffffff1a] transition-colors rounded-md">
                        <td className="px-6 py-4 w-12">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white group-hover:text-[#1DB954]">{booking.customerName}</div>
                          <div className="text-xs">{booking.phone}</div>
                        </td>
                        <td className="px-6 py-4">{booking.date} • {booking.time}</td>
                        <td className="px-6 py-4 font-bold text-white">{booking.representative}</td>
                        <td className="px-6 py-4">
                           {booking.leadQuality && (
                             <span className={`px-2 py-0.5 rounded-sm text-[10px] ${getQualityBadge(booking.leadQuality)}`}>
                               {booking.leadQuality.toUpperCase()}
                             </span>
                           )}
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${getStatusColor(booking.status)}`}>
                          {booking.status.toUpperCase()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* AI Insights - "Now Playing" cards */}
          <section>
             <h3 className="text-2xl font-black mb-6 flex items-center gap-2 italic">
               <Zap size={24} className="text-[#1DB954]" /> AI TOP CHARTS
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nextCalls.slice(0, 3).map(call => (
                  <div key={call.id} className="bg-[#181818] p-5 rounded-lg hover:bg-[#282828] transition-all group cursor-default border border-transparent hover:border-[#333]">
                    <div className="w-full aspect-square bg-[#333] mb-4 rounded-md flex items-center justify-center relative overflow-hidden group">
                       {call.leadQuality === 'Het' ? (
                         <Zap size={64} className="text-[#1DB954] opacity-50" />
                       ) : (
                         <Users size={64} className="text-[#555]" />
                       )}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <div className="w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                           <TrendingUp size={24} className="text-black" />
                         </div>
                       </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-lg truncate">{call.customerName}</p>
                        {call.leadQuality && (
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-sm ${getQualityBadge(call.leadQuality)}`}>
                            {call.leadQuality}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#b3b3b3]">{call.representative} • {call.time}</p>
                      <div className="pt-3 min-h-[60px]">
                        {activeAnalysisId === call.id ? (
                          <p className="text-xs text-[#1DB954] animate-pulse">Analyserar prospekt...</p>
                        ) : call.aiSummary ? (
                          <p className="text-xs text-[#b3b3b3] leading-relaxed line-clamp-3">"{call.aiSummary}"</p>
                        ) : (
                          <p className="text-xs text-[#555] italic">Väntar på analys</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </section>
        </div>
      </main>

      {/* Footer Mobile Nav - Spotify Bar */}
      <footer className="md:hidden fixed bottom-2 left-2 right-2 bg-black/90 backdrop-blur-md border border-[#282828] rounded-full p-2 flex justify-around items-center z-40 shadow-2xl">
        <button onClick={() => setViewMode('calendar')} className={`flex flex-col items-center p-2 transition-colors ${viewMode === 'calendar' ? 'text-white' : 'text-[#b3b3b3]'}`}>
          <Home size={24} />
          <span className="text-[10px] font-bold mt-0.5">Hem</span>
        </button>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center bg-[#1DB954] text-black w-14 h-14 rounded-full shadow-lg active:scale-90 transition-transform">
          <Plus size={32} />
        </button>
        <button onClick={() => setViewMode('list')} className={`flex flex-col items-center p-2 transition-colors ${viewMode === 'list' ? 'text-white' : 'text-[#b3b3b3]'}`}>
          <Library size={24} />
          <span className="text-[10px] font-bold mt-0.5">Bibliotek</span>
        </button>
      </footer>

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
