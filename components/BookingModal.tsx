
import React, { useState } from 'react';
import { X, User, Phone, Mail, Calendar as CalIcon, Clock, MessageSquare, Briefcase } from 'lucide-react';
import { Booking, Representative } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Partial<Booking>) => void;
  initialDate?: Date;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onSave, initialDate }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    date: initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: '09:00',
    representative: 'Niclas' as Representative,
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const inputClasses = "w-full p-3 bg-[#282828] border border-transparent rounded-md focus:border-[#535353] focus:bg-[#333] outline-none transition-all text-white text-sm placeholder:text-[#535353]";
  const labelClasses = "text-xs font-black text-[#b3b3b3] uppercase tracking-widest flex items-center gap-2 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-[#181818] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#282828] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-[#282828] flex justify-between items-center bg-[#181818]">
          <h2 className="text-xl font-black text-white">BOKA SAMTAL</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#282828] rounded-full transition-colors text-[#b3b3b3] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className={labelClasses}>
              <User size={14} /> Kundens namn
            </label>
            <input
              required
              className={inputClasses}
              value={formData.customerName}
              onChange={e => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              placeholder="Vem ringer vi?"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={labelClasses}>
                <Phone size={14} /> Telefon
              </label>
              <input
                required
                className={inputClasses}
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="070..."
              />
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>
                <Mail size={14} /> E-post
              </label>
              <input
                type="email"
                className={inputClasses}
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Valfritt"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={labelClasses}>
                <CalIcon size={14} /> Datum
              </label>
              <input
                type="date"
                required
                className={inputClasses}
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>
                <Clock size={14} /> Tid
              </label>
              <input
                type="time"
                required
                className={inputClasses}
                value={formData.time}
                onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>
              <Briefcase size={14} /> Handläggare
            </label>
            <div className="flex gap-4">
              {(['Niclas', 'Johan'] as Representative[]).map(rep => (
                <label key={rep} className="flex-1">
                  <input
                    type="radio"
                    name="representative"
                    className="hidden peer"
                    checked={formData.representative === rep}
                    onChange={() => setFormData(prev => ({ ...prev, representative: rep }))}
                  />
                  <div className="p-3 text-center rounded-md border border-[#282828] bg-black/20 text-xs font-black cursor-pointer peer-checked:bg-[#1DB954] peer-checked:text-black peer-checked:border-transparent hover:bg-[#282828] transition-all uppercase tracking-widest">
                    {rep}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>
              <MessageSquare size={14} /> Anteckningar
            </label>
            <textarea
              className={`${inputClasses} min-h-[100px] resize-none`}
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Vad vill kunden diskutera?"
            />
          </div>

          <div className="flex items-center justify-end gap-6 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-black text-[#b3b3b3] hover:text-white transition-colors uppercase tracking-widest"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="bg-[#1DB954] text-black px-10 py-4 rounded-full font-black hover:scale-105 active:scale-95 transition-all shadow-xl uppercase tracking-tighter"
            >
              BOKA SAMTAL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
