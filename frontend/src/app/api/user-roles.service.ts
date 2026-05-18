import { api } from './client';

export interface UserRole {
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

export interface CreateUserRoleDto {
  name: string;
  description?: string;
  permissions?: Record<string, any>;
}

export interface UpdateUserRoleDto {
  name?: string;
  description?: string;
  permissions?: Record<string, any>;
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export interface UserRolesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedData {
  data: UserRole[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const userRolesApi = {
  findMany: (query?: UserRolesQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.search) params.set('search', query.search);
    if (query?.status) params.set('status', query.status);
    if (query?.sortBy) params.set('sortBy', query.sortBy);
    if (query?.sortOrder) params.set('sortOrder', query.sortOrder);
    const queryString = params.toString();
    return api.get<ApiResponse<PaginatedData>>(`/user-roles${queryString ? `?${queryString}` : ''}`, true);
  },

  findAll: () => {
    return api.get<ApiResponse<UserRole[]>>('/user-roles/all', true);
  },

  findOne: (id: number) => {
    return api.get<ApiResponse<UserRole>>(`/user-roles/${id}`, true);
  },

  create: (dto: CreateUserRoleDto) => {
    return api.post<ApiResponse<UserRole>>('/user-roles', dto, true);
  },

  update: (id: number, dto: UpdateUserRoleDto) => {
    return api.patch<ApiResponse<UserRole>>(`/user-roles/${id}`, dto, true);
  },

  remove: (id: number) => {
    return api.delete<ApiResponse<UserRole>>(`/user-roles/${id}`, true);
  },
};
