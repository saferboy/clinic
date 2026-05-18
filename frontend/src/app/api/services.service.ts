import { api } from './client';

export type ServiceStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface BackendService {
  id: number;
  name: string;
  price: number;
  department_id: number | null;
  duration_min: number;
  description: string | null;
  status: ServiceStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  registered_by: number | null;
  modified_by: number | null;
  department?: { id: number; name: string };
  _count?: { service_users: number; visit_services: number };
}

export interface CreateServiceDto {
  name: string;
  price: number;
  department_id?: number;
  duration_min?: number;
  description?: string;
  status?: ServiceStatus;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

export interface UpdateServicePriceDto {
  price: number;
  reason?: string;
}

export interface ServicesQuery {
  page?: number;
  limit?: number;
  department_id?: number;
  status?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const servicesApi = {
  findMany: (query?: ServicesQuery) => {
    const params = new URLSearchParams();
    if (query?.page) params.set('page', String(query.page));
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.department_id) params.set('department_id', String(query.department_id));
    if (query?.status) params.set('status', query.status);
    if (query?.search) params.set('search', query.search);
    if (query?.min_price !== undefined) params.set('min_price', String(query.min_price));
    if (query?.max_price !== undefined) params.set('max_price', String(query.max_price));
    if (query?.sortBy) params.set('sortBy', query.sortBy);
    if (query?.sortOrder) params.set('sortOrder', query.sortOrder);
    const qs = params.toString();
    return api.get<any>(`/services${qs ? `?${qs}` : ''}`, true);
  },

  findByDepartment: (departmentId: number, status = 'ACTIVE') => {
    return api.get<any>(`/services/departments/${departmentId}?status=${status}`, true);
  },

  findOne: (id: number) =>
    api.get<any>(`/services/${id}`, true),

  create: (dto: CreateServiceDto) =>
    api.post<any>('/services', dto, true),

  update: (id: number, dto: UpdateServiceDto) =>
    api.patch<any>(`/services/${id}`, dto, true),

  updatePrice: (id: number, dto: UpdateServicePriceDto) =>
    api.patch<any>(`/services/${id}/price`, dto, true),

  remove: (id: number) =>
    api.delete<any>(`/services/${id}`, true),
};
