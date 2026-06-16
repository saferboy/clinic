import { api } from './client';

export interface Visit {
  id: number;
  client_id: number;
  doctor_id: number | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'DONE' | 'CANCELLED' | 'NO_SHOW';
  total_amount: number;
  paid_amount: number;
  debt_amount: number;
  description: string | null;
  visit_date: string;
  created_at: string;
  updated_at: string;
  registered_by: number | null;
  modified_by: number | null;
  client: {
    id: number;
    full_name: string;
    phone: string;
    source?: { id: number; name: string } | null;
  };
  doctor: {
    id: number;
    full_name: string;
  } | null;
  visit_services?: VisitService[];
  visit_rooms?: VisitRoom[];
  visit_referrals?: VisitReferral[];
  payments?: Payment[];
  _count?: {
    visit_services: number;
    visit_rooms: number;
    visit_referrals: number;
    payments: number;
  };
}

export interface VisitService {
  id: number;
  visit_id: number;
  service_id: number;
  price: number;
  quantity: number;
  total: number;
  created_at: string;
  service: {
    id: number;
    name: string;
  };
}

export interface VisitRoom {
  id: number;
  visit_id: number;
  room_id: number;
  status: 'ASSIGNED' | 'COMPLETED';
  started_at: string;
  ended_at: string | null;
  room: {
    id: number;
    name: string;
    room_number: string;
  };
}

export interface VisitReferral {
  id: number;
  visit_id: number;
  referral_id: number;
  referral: {
    id: number;
    full_name: string;
    phone: string;
  };
}

export interface Payment {
  id: number;
  visit_id: number;
  client_id: number;
  user_id: number;
  amount: number;
  payment_type: 'INCOME' | 'OUTCOME';
  description: string | null;
  payment_date: string;
}

export interface CreateVisitDto {
  client_id: number;
  doctor_id?: number;
  room_id?: number;
  service_ids?: number[];
  status?: 'SCHEDULED' | 'IN_PROGRESS';
  visit_date?: string;
  description?: string;
}

export interface UpdateVisitDto {
  doctor_id?: number;
  visit_date?: string;
  description?: string;
}

export interface UpdateVisitStatusDto {
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'DONE' | 'CANCELLED' | 'NO_SHOW';
}

export interface AddVisitServiceDto {
  service_id: number;
  quantity?: number;
  price?: number;
}

export interface AssignVisitRoomDto {
  room_id?: number;
  started_at?: string;
}

export interface LinkVisitReferralDto {
  referral_id: number;
}

export interface CreateVisitPaymentDto {
  amount: number;
  description?: string;
}

export interface VisitsQuery {
  page?: number;
  limit?: number;
  client_id?: number;
  doctor_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const visitsApi = {
  /**
   * Yangi visit yaratish
   */
  create: (dto: CreateVisitDto) =>
    api.post<ApiResponse<Visit>>('/visits', dto, true),

  /**
   * Visitlar ro'yxatini olish (pagination bilan)
   */
  findMany: (query?: VisitsQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.client_id) params.set('client_id', String(query.client_id));
    if (query?.doctor_id) params.set('doctor_id', String(query.doctor_id));
    if (query?.status) params.set('status', query.status);
    if (query?.date_from) params.set('date_from', query.date_from);
    if (query?.date_to) params.set('date_to', query.date_to);
    if (query?.sortBy) params.set('sortBy', query.sortBy);
    if (query?.sortOrder) params.set('sortOrder', query.sortOrder);

    const queryString = params.toString();
    return api.get<ApiResponse<Visit[]>>(`/visits${queryString ? `?${queryString}` : ''}`, true);
  },

  /**
   * Bitta visitni olish
   */
  findOne: (id: number) =>
    api.get<ApiResponse<Visit>>(`/visits/${id}`, true),

  /**
   * Visitni yangilash
   */
  update: (id: number, dto: UpdateVisitDto) =>
    api.patch<ApiResponse<Visit>>(`/visits/${id}`, dto, true),

  /**
   * Visit status o'zgartirish
   */
  updateStatus: (id: number, dto: UpdateVisitStatusDto) =>
    api.patch<ApiResponse<Visit>>(`/visits/${id}/status`, dto, true),

  /**
   * Visitga xizmat qo'shish
   */
  addService: (id: number, dto: AddVisitServiceDto) =>
    api.post<ApiResponse<VisitService>>(`/visits/${id}/services`, dto, true),

  /**
   * Visitga xona ajratish
   */
  assignRoom: (id: number, dto: AssignVisitRoomDto) =>
    api.post<ApiResponse<VisitRoom>>(`/visits/${id}/rooms`, dto, true),

  /**
   * Visitga tavsiya biriktirish
   */
  linkReferral: (id: number, dto: LinkVisitReferralDto) =>
    api.post<ApiResponse<VisitReferral>>(`/visits/${id}/referrals`, dto, true),

  /**
   * Visitni yakunlash
   */
  complete: (id: number) =>
    api.put<ApiResponse<Visit>>(`/visits/${id}/complete`, undefined, true),

  /**
   * Visitga to'lov yaratish
   */
  createPayment: (id: number, dto: CreateVisitPaymentDto) =>
    api.post<ApiResponse<Payment>>(`/visits/${id}/payments`, dto, true),

  /**
   * Visitni bekor qilish (soft delete)
   */
  remove: (id: number) =>
    api.delete<ApiResponse<Visit>>(`/visits/${id}`, true),

  /**
   * Visit xizmatlarini olish
   */
  getServices: (id: number) =>
    api.get<ApiResponse<VisitService[]>>(`/visits/${id}/services`, true),

  /**
   * Visit xonalarini olish
   */
  getRooms: (id: number) =>
    api.get<ApiResponse<VisitRoom[]>>(`/visits/${id}/rooms`, true),

  /**
   * Visit to'lovlarini olish
   */
  getPayments: (id: number) =>
    api.get<ApiResponse<Payment[]>>(`/visits/${id}/payments`, true),
};