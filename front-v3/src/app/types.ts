export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'accountant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  specialty?: string;
  active: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: 'male' | 'female';
  address: string;
  group: string;
  source: string;
  balance: number;
  totalVisits: number;
  lastVisit: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export type VisitStatus = 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  active: boolean;
}

export interface VisitService {
  id: string;
  name: string;
  price: number;
}

export interface Visit {
  id: string;
  clientId: string;
  clientName: string;
  doctorId: string;
  doctorName: string;
  roomId: string;
  roomName: string;
  services: VisitService[];
  date: string;
  time: string;
  duration: number;
  status: VisitStatus;
  notes: string;
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
}

export type PaymentType = 'cash' | 'card' | 'transfer';

export interface Payment {
  id: string;
  clientId: string;
  clientName: string;
  visitId: string;
  amount: number;
  type: PaymentType;
  direction: 'income' | 'outcome';
  description: string;
  date: string;
  createdBy: string;
}

export interface Room {
  id: string;
  name: string;
  number: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance';
  floor: number;
  doctor: string;
}

export interface KpiCard {
  label: string;
  value: string | number;
  change: number;
  icon: string;
  color: string;
}
