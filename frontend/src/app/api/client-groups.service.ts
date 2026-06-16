import { api } from './client';

export interface ClientGroup {
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

export interface ClientGroupsResponse {
  success: boolean;
  message: string;
  data: {
    data: ClientGroup[];
    pagination: Pagination;
  };
}

export interface ClientGroupQuery {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const clientGroupsApi = {
  findMany: (query?: ClientGroupQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.status) params.set('status', query.status);
    if (query?.search) params.set('search', query.search);
    if (query?.sortBy) params.set('sortBy', query.sortBy);
    if (query?.sortOrder) params.set('sortOrder', query.sortOrder);

    const queryString = params.toString();
    return api.get<ClientGroupsResponse>(`/client-groups${queryString ? `?${queryString}` : ''}`, true);
  },

  findOne: (id: number) => {
    return api.get<{ success: boolean; message: string; data: ClientGroup }>(`/client-groups/${id}`, true);
  },

  create: (dto: { name: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => {
    return api.post<{ success: boolean; message: string; data: ClientGroup }>('/client-groups', dto, true);
  },

  update: (id: number, dto: { name?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => {
    return api.patch<{ success: boolean; message: string; data: ClientGroup }>(`/client-groups/${id}`, dto, true);
  },

  remove: (id: number) => {
    return api.delete<{ success: boolean; message: string }>(`/client-groups/${id}`, true);
  },
};