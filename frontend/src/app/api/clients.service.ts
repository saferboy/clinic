import { api } from './client';

export interface Client {
  id: number;
  full_name: string;
  phone: string;
  group_id: number | null;
  group?: {
    id: number;
    name: string;
  };
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  date_of_birth: string | null;
  region_id: number | null;
  region?: {
    id: number;
    name: string;
  };
  district_id: number | null;
  district?: {
    id: number;
    name: string;
  };
  address: string | null;
  source_id: number | null;
  source?: {
    id: number;
    name: string;
  };
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  balance: number;
  _count?: {
    visits: number;
    payments: number;
  };
  last_visit?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientDto {
  full_name: string;
  phone: string;
  group_id?: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  date_of_birth?: string;
  region_id?: number;
  district_id?: number;
  address?: string;
  source_id?: number;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export interface UpdateClientDto {
  full_name?: string;
  phone?: string;
  group_id?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  date_of_birth?: string;
  region_id?: number;
  district_id?: number;
  address?: string;
  source_id?: number;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export interface ClientsQuery {
  page?: number;
  limit?: number;
  phone?: string;
  full_name?: string;
  group_id?: number;
  region_id?: number;
  district_id?: number;
  source_id?: number;
  status?: string;
  gender?: string;
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

export interface ClientStats {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  male: number;
  female: number;
  debt: number;
}

export const clientsApi = {
  /**
   * Mijozlar statistikasini olish
   */
  getStats: () =>
    api.get<ApiResponse<ClientStats>>('/clients/stats', true),

  /**
   * Mijozlar ro'yxatini olish (pagination bilan)
   */
  findMany: (query?: ClientsQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.phone) params.set('phone', query.phone);
    if (query?.full_name) params.set('full_name', query.full_name);
    if (query?.group_id) params.set('group_id', String(query.group_id));
    if (query?.region_id) params.set('region_id', String(query.region_id));
    if (query?.district_id) params.set('district_id', String(query.district_id));
    if (query?.source_id) params.set('source_id', String(query.source_id));
    if (query?.status) params.set('status', query.status);
    if (query?.gender) params.set('gender', query.gender);
    if (query?.sortBy) params.set('sortBy', query.sortBy);
    if (query?.sortOrder) params.set('sortOrder', query.sortOrder);

    const queryString = params.toString();
    return api.get<ApiResponse<Client[]>>(`/clients${queryString ? `?${queryString}` : ''}`, true);
  },

  /**
   * Mijozlarni qidirish (search endpoint)
   */
  search: (query: { phone?: string; full_name?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (query.phone) params.set('phone', query.phone);
    if (query.full_name) params.set('full_name', query.full_name);
    if (query.limit) params.set('limit', String(query.limit));
    const queryString = params.toString();
    return api.get<ApiResponse<Client[]>>(`/clients/search${queryString ? `?${queryString}` : ''}`, true);
  },

  /**
   * Bitta mijozni olish
   */
  findOne: (id: number) =>
    api.get<ApiResponse<Client>>(`/clients/${id}`, true),

  /**
   * Yangi mijoz yaratish
   */
  create: (dto: CreateClientDto) =>
    api.post<ApiResponse<Client>>('/clients', dto, true),

  /**
   * Mijozni yangilash
   */
  update: (id: number, dto: UpdateClientDto) =>
    api.patch<ApiResponse<Client>>(`/clients/${id}`, dto, true),

  /**
   * Mijozni o'chirish
   */
  remove: (id: number) =>
    api.delete<ApiResponse<Client>>(`/clients/${id}`, true),

  /**
   * Mijoz balansini olish
   */
  getBalance: (id: number) =>
    api.get<ApiResponse<{ balance: number }>>(`/clients/${id}/balance`, true),

  /**
   * Mijoz tashriflarini olish
   */
  getVisits: (id: number, query?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    const queryString = params.toString();
    return api.get<ApiResponse<Record<string, unknown>[]>>(`/clients/${id}/visits${queryString ? `?${queryString}` : ''}`, true);
  },

  /**
   * Mijoz to'lovlarini olish
   */
  getPayments: (id: number, query?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    const queryString = params.toString();
    return api.get<ApiResponse<Record<string, unknown>[]>>(`/clients/${id}/payments${queryString ? `?${queryString}` : ''}`, true);
  },

  getGroups: () => api.get<{ success: boolean; message: string; data: { data: { id: number; name: string }[]; pagination: { total: number } } }>('/client-groups?limit=100', true),
};
