import { api } from './client';

export interface Department {
  id: number;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface DepartmentsResponse {
  success: boolean;
  message: string;
  data: {
    data: Department[];
    pagination: Pagination;
  };
}

export interface DepartmentsQuery {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const departmentsApi = {
  /**
   * Barcha bo'limlarni olish (pagination bilan)
   */
  findMany: (query?: DepartmentsQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.status) params.set('status', query.status);
    if (query?.search) params.set('search', query.search);
    if (query?.sortBy) params.set('sortBy', query.sortBy);
    if (query?.sortOrder) params.set('sortOrder', query.sortOrder);

    const queryString = params.toString();
    return api.get<DepartmentsResponse>(`/departments${queryString ? `?${queryString}` : ''}`, true);
  },

  /**
   * Barcha bo'limlarni olish (limit 100, dropdown uchun)
   */
  findAll: () => {
    return api.get<DepartmentsResponse>('/departments?limit=100&sortBy=name&sortOrder=asc', true);
  },

  /**
   * Bitta bo'limni olish
   */
  findOne: (id: number) => {
    return api.get<{ success: boolean; message: string; data: Department }>(`/departments/${id}`, true);
  },

  /**
   * Yangi bo'lim yaratish
   */
  create: (dto: { name: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => {
    return api.post<{ success: boolean; message: string; data: Department }>('/departments', dto, true);
  },

  /**
   * Bo'limni yangilash
   */
  update: (id: number, dto: { name?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => {
    return api.patch<{ success: boolean; message: string; data: Department }>(`/departments/${id}`, dto, true);
  },

  /**
   * Bo'limni o'chirish
   */
  remove: (id: number) => {
    return api.delete<{ success: boolean; message: string }>(`/departments/${id}`, true);
  },
};
