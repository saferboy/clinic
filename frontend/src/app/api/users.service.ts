import { api } from './client';
import type {
  BackendUser,
  CreateUserDto,
  UpdateUserDto,
  FrontendUser,
} from './users.types';

// Pagination params
export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role_id?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Backend pagination response
interface UsersPaginatedResponse {
  data: BackendUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Backend user'ni frontend formatga map qilish
const mapBackendToFrontend = (user: BackendUser): FrontendUser => ({
  id: user.id,
  login: user.login,
  fullName: user.full_name,
  email: user.email,
  phone: user.phone,
  role: user.role ?? null,
  description: user.description,
  status: user.status,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

export const usersService = {
  /**
   * Barcha user'larni olish (pagination bilan)
   */
  async getAll(params?: UsersQueryParams): Promise<{ users: FrontendUser[]; meta: UsersPaginatedResponse['meta'] }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));
    if (params?.search) queryParams.set('search', params.search);
    if (params?.role_id) queryParams.set('role_id', String(params.role_id));
    if (params?.status) queryParams.set('status', params.status);
    if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.set('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const response = await api.get<UsersPaginatedResponse>(`/users${queryString ? `?${queryString}` : ''}`, true);
    return {
      users: response.data.map(mapBackendToFrontend),
      meta: response.meta,
    };
  },

  /**
   * Bitta user'ni olish
   */
  async getById(id: number): Promise<FrontendUser> {
    const user = await api.get<BackendUser>(`/users/${id}`, true);
    return mapBackendToFrontend(user);
  },

  /**
   * Yangi user yaratish
   */
  async create(dto: CreateUserDto): Promise<FrontendUser> {
    const user = await api.post<BackendUser>('/users', dto, true);
    return mapBackendToFrontend(user);
  },

  /**
   * User'ni yangilash
   */
  async update(id: number, dto: UpdateUserDto): Promise<FrontendUser> {
    const user = await api.patch<BackendUser>(`/users/${id}`, dto, true);
    return mapBackendToFrontend(user);
  },

  /**
   * User'ni o'chirish (soft delete)
   */
  async delete(id: number): Promise<FrontendUser> {
    const user = await api.delete<BackendUser>(`/users/${id}`, true);
    return mapBackendToFrontend(user);
  },

  /**
   * User status'ini o'zgartirish
   */
  async toggleStatus(id: number, currentStatus: 'ACTIVE' | 'INACTIVE'): Promise<FrontendUser> {
    return this.update(id, {
      status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
  },

  /**
   * Foydalanuvchi parolini tiklash (admin)
   */
  async resetPassword(id: number, newPassword?: string): Promise<{ tempPassword: string }> {
    return api.post<{ tempPassword: string }>(`/users/${id}/reset-password`, newPassword ? { newPassword } : undefined, true);
  },
};
