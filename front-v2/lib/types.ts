// User and Auth Types
export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Client/Patient Types
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address?: string;
  insuranceNumber?: string;
  bloodType?: string;
  medicalHistory?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  category: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Room Types
export interface Room {
  id: string;
  name: string;
  type: 'consultation' | 'treatment' | 'surgery' | 'waiting';
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance';
  equipment?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Visit/Appointment Types
export interface Visit {
  id: string;
  clientId: string;
  serviceId: string;
  doctorId: string;
  roomId?: string;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface Payment {
  id: string;
  visitId: string;
  clientId: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'insurance';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  invoiceNumber?: string;
  notes?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard Analytics Types
export interface DashboardStats {
  totalClients: number;
  totalVisits: number;
  totalRevenue: number;
  appointmentsToday: number;
  averageRating: number;
}

export interface DashboardChart {
  date: string;
  visits: number;
  revenue: number;
}

// Report Types
export interface ReportFilter {
  startDate: Date;
  endDate: Date;
  userId?: string;
  clientId?: string;
  status?: string;
}

export interface ReportData {
  id: string;
  type: 'visits' | 'payments' | 'clients';
  title: string;
  data: unknown[];
  generatedAt: Date;
}
