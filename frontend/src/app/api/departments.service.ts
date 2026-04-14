import { api } from './client';

export interface Department {
  id: number;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface DepartmentsResponse {
  success: boolean;
  message: string;
  data: Department[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const departmentsApi = {
  /**
   * Barcha bo'limlarni olish
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
};
