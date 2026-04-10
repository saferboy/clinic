// Backend'dan keladigan user response type
export interface BackendUser {
  id: number;
  role_id: number | null;
  full_name: string | null;
  login: string;
  phone: string | null;
  email: string | null;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  role: {
    id: number;
    name: string;
    permissions: Record<string, any>;
  } | null;
}

// User yaratish DTO
export interface CreateUserDto {
  login: string;
  password: string;
  full_name?: string;
  phone?: string;
  email?: string;
  role_id?: number;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// User yangilash DTO
export interface UpdateUserDto extends Partial<CreateUserDto> {}

// Frontend uchun user type (mapped)
export interface FrontendUser {
  id: number;
  login: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  role: {
    id: number;
    name: string;
    permissions: Record<string, any>;
  } | null;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}
