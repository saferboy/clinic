import { api } from './client';
import type { Room } from '../types';

export interface CreateRoomDto {
  name: string;
  room_number?: string;
  department_id?: number;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLOSED';
  description?: string;
  record_status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export interface UpdateRoomDto {
  name?: string;
  room_number?: string;
  department_id?: number;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLOSED';
  description?: string;
  record_status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export interface UpdateRoomStatusDto {
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLOSED';
  reason?: string;
}

export interface RoomsQuery {
  page?: number;
  limit?: number;
  department_id?: number;
  status?: string;
  record_status?: string;
  search?: string;
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

export interface RoomStats {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  closed: number;
}

export const roomsApi = {
  /**
   * Xonalar ro'yxatini olish (pagination bilan)
   */
  findMany: (query?: RoomsQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.department_id) params.set('department_id', String(query.department_id));
    if (query?.status) params.set('status', query.status);
    if (query?.record_status) params.set('record_status', query.record_status);
    if (query?.search) params.set('search', query.search);
    if (query?.sortBy) params.set('sortBy', query.sortBy);
    if (query?.sortOrder) params.set('sortOrder', query.sortOrder);
    
    const queryString = params.toString();
    return api.get<ApiResponse<Room[]>>(`/rooms${queryString ? `?${queryString}` : ''}`, true);
  },

  /**
   * Bo'sh xonalarni olish
   */
  findAvailable: (department_id?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (department_id) params.set('department_id', String(department_id));
    if (limit) params.set('limit', String(limit));
    const queryString = params.toString();
    return api.get<ApiResponse<Room[]>>(`/rooms/available${queryString ? `?${queryString}` : ''}`, true);
  },

  /**
   * Xonalar statistikasini olish
   */
  getStats: (department_id?: number) => {
    const params = new URLSearchParams();
    if (department_id) params.set('department_id', String(department_id));
    const queryString = params.toString();
    return api.get<ApiResponse<RoomStats>>(`/rooms/stats${queryString ? `?${queryString}` : ''}`, true);
  },

  /**
   * Bitta xonani olish
   */
  findOne: (id: number) => 
    api.get<ApiResponse<Room>>(`/rooms/${id}`, true),

  /**
   * Yangi xona yaratish
   */
  create: (dto: CreateRoomDto) => 
    api.post<ApiResponse<Room>>('/rooms', dto, true),

  /**
   * Xonani yangilash
   */
  update: (id: number, dto: UpdateRoomDto) => 
    api.patch<ApiResponse<Room>>(`/rooms/${id}`, dto, true),

  /**
   * Xona statusini o'zgartirish
   */
  updateStatus: (id: number, dto: UpdateRoomStatusDto) => 
    api.patch<ApiResponse<Room>>(`/rooms/${id}/status`, dto, true),

  /**
   * Xonani o'chirish (Soft Delete)
   */
  remove: (id: number) => 
    api.delete<ApiResponse<Room>>(`/rooms/${id}`, true),
};
