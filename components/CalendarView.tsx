
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
  const firstDay = (getFirstDayOfMonth(currentDate) + 6) % 7; // Adjust for Monday start
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 capitalize">{monthName}</h2>
        <div className="flex gap-2">
          <button onClick={onPrevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ChevronLeft size={20} />
          </button>
          <button onClick={onNextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100">
        {weekDays.map(day => (
          <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {paddingArray.map(i => (
          <div key={`padding-${i}`} className="h-24 sm:h-32 border-b border-r border-slate-50 bg-slate-50/30" />
        ))}
        {daysArray.map(day => {
          const dayBookings = getBookingsForDay(day);
          const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

          return (
            <div
              key={day}
              onClick={() => onDateClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
              className={`h-24 sm:h-32 border-b border-r border-slate-100 p-2 cursor-pointer hover:bg-indigo-50/30 transition-colors group relative`}
            >
              <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-semibold rounded-full transition-colors ${
                isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 group-hover:text-indigo-600'
              }`}>
                {day}
              </span>

              <div className="mt-2 space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
                {dayBookings.slice(0, 3).map(booking => (
                  <div
                    key={booking.id}
                    className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-medium truncate ${
                      booking.representative === 'Niclas' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                    <span className="font-bold">{booking.time}</span> {booking.customerName}
                  </div>
                ))}
                {dayBookings.length > 3 && (
                  <div className="text-[10px] text-slate-400 font-medium pl-1 italic">
                    + {dayBookings.length - 3} till...
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
