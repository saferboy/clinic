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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ServiceListResponse {
  success: boolean;
  message: string;
  data: BackendService[];
  pagination: Pagination;
}

interface ServiceSingleResponse {
  success: boolean;
  message: string;
  data: BackendService;
}

interface ServiceDeleteResponse {
  success: boolean;
  message: string;
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
    return api.get<ServiceListResponse>(`/services${qs ? `?${qs}` : ''}`, true);
  },

  findByDepartment: (departmentId: number, status = 'ACTIVE') => {
    return api.get<ServiceListResponse>(`/services/departments/${departmentId}?status=${status}`, true);
  },

  findOne: (id: number) =>
    api.get<ServiceSingleResponse>(`/services/${id}`, true),

  create: (dto: CreateServiceDto) =>
    api.post<ServiceSingleResponse>('/services', dto, true),

  update: (id: number, dto: UpdateServiceDto) =>
    api.patch<ServiceSingleResponse>(`/services/${id}`, dto, true),

  updatePrice: (id: number, dto: UpdateServicePriceDto) =>
    api.patch<ServiceSingleResponse>(`/services/${id}/price`, dto, true),

  remove: (id: number) =>
    api.delete<ServiceDeleteResponse>(`/services/${id}`, true),
};
