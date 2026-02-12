
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Booking } from '../types';

interface CalendarViewProps {
  currentDate: Date;
  bookings: Booking[];
  onDateClick: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  currentDate, 
  bookings, 
  onDateClick, 
  onPrevMonth, 
  onNextMonth 
}) => {
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const days = getDaysInMonth(currentDate);
  const firstDay = (getFirstDayOfMonth(currentDate) + 6) % 7;
  const monthName = currentDate.toLocaleString('sv-SE', { month: 'long', year: 'numeric' });
  const weekDays = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

  const daysArray = Array.from({ length: days }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDay }, (_, i) => i);

  const getBookingsForDay = (day: number) => {
    const dateString = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    return bookings.filter(b => b.date === dateString);
  };

  return (
    <div className="bg-[#121212] rounded-xl overflow-hidden shadow-2xl">
      <div className="p-6 flex items-center justify-between border-b border-[#282828]">
        <h2 className="text-xl font-black text-white capitalize">{monthName}</h2>
        <div className="flex gap-4">
          <button onClick={onPrevMonth} className="p-2 hover:bg-[#282828] rounded-full transition-colors text-[#b3b3b3] hover:text-white">
            <ChevronLeft size={24} />
          </button>
          <button onClick={onNextMonth} className="p-2 hover:bg-[#282828] rounded-full transition-colors text-[#b3b3b3] hover:text-white">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-[#282828] bg-black/40">
        {weekDays.map(day => (
          <div key={day} className="py-4 text-center text-[10px] font-black text-[#b3b3b3] uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {paddingArray.map(i => (
          <div key={`padding-${i}`} className="h-24 sm:h-32 border-b border-r border-[#1a1a1a] bg-black/20" />
        ))}
        {daysArray.map(day => {
          const dayBookings = getBookingsForDay(day);
          const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

          return (
            <div
              key={day}
              onClick={() => onDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
              className={`h-24 sm:h-32 border-b border-r border-[#1a1a1a] p-2 cursor-pointer hover:bg-[#282828] transition-all group relative`}
            >
              <div className="flex justify-between items-start">
                <span className={`inline-flex items-center justify-center w-7 h-7 text-xs font-black rounded-full transition-all ${
                  isToday ? 'bg-[#1DB954] text-black shadow-lg shadow-[#1DB954]/20' : 'text-[#b3b3b3] group-hover:text-white'
                }`}>
                  {day}
                </span>
                {dayBookings.length > 0 && !isToday && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1DB954] mt-1" />
                )}
              </div>

              <div className="mt-2 space-y-1 overflow-hidden">
                {dayBookings.slice(0, 2).map(booking => (
                  <div
                    key={booking.id}
                    className={`text-[9px] px-1.5 py-1 rounded-sm flex items-center gap-1 font-bold truncate ${
                      booking.representative === 'Niclas' ? 'bg-[#2e2e2e] text-blue-400' : 'bg-[#2e2e2e] text-[#1DB954]'
                    }`}
                  >
                    <span className="font-black opacity-70">{booking.time}</span> {booking.customerName}
                  </div>
                ))}
                {dayBookings.length > 2 && (
                  <div className="text-[9px] text-[#555] font-black pl-1">
                    + {dayBookings.length - 2} TILL
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
