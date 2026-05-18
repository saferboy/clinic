export type UserRole = 'SuperAdmin' | 'Admin' | 'Doctor' | 'Nurse' | 'Receptionist' | 'Accountant';

// UserRole (backend dan)
export interface BackendUserRole {
  id: number;
  name: string;
  description: string | null;
  permissions: Record<string, any> | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
  registered_by: number | null;
  modified_by: number | null;
}

export interface User {
  id: number;
  login: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  role: {
    id: number;
    name: UserRole;
    permissions: Record<string, any>;
  };
  specialty?: string;
  status?: string;
}

// Backend dan keladigan raw user type
export interface BackendUser {
  id: number;
  login: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  role_id: number | null;
  role: {
    id: number;
    name: string;
    permissions: Record<string, any>;
  } | null;
  created_at: string;
  updated_at: string;
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
  id: number;
  name: string;
  price: number;
  department_id: number | null;
  duration_min: number;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  department?: { id: number; name: string };
  _count?: { service_users: number; visit_services: number };
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
  id: number;
  name: string;
  room_number: string | null;
  department_id: number | null;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLOSED';
  description: string | null;
  record_status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  registered_by: number | null;
  modified_by: number | null;
  department?: {
    id: number;
    name: string;
  };
  _count?: {
    visit_rooms: number;
  };
}

export interface KpiCard {
  label: string;
  value: string | number;
  change: number;
  icon: string;
  color: string;
}
