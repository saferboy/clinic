import { api } from './client';

export interface Source {
  id: number;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

interface SourceResponse {
  success: boolean;
  message: string;
  data: Source;
}

interface SourcesListResponse {
  success: boolean;
  message: string;
  data: Source[];
}

export const sourcesApi = {
  findMany: () =>
    api.get<SourcesListResponse>('/sources', true),

  create: (dto: { name: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) =>
    api.post<SourceResponse>('/sources', dto, true),

  update: (id: number, dto: { name?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) =>
    api.patch<SourceResponse>(`/sources/${id}`, dto, true),

  remove: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/sources/${id}`, true),
};
