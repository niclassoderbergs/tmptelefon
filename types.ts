
export type Representative = 'Niclas' | 'Johan';

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  email?: string; // Valfritt fält
  date: string; // ISO format
  time: string; // HH:mm
  representative: Representative;
  notes: string;
  status: 'pending' | 'completed' | 'cancelled';
  leadQuality?: 'Kall' | 'Varm' | 'Het';
  aiSummary?: string;
}

export type ViewMode = 'calendar' | 'list';
