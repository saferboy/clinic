import { api } from './client';

export interface ClinicSettings {
  id: number;
  name: string;
  tin: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  work_start: string | null;
  work_end: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateClinicSettingsDto {
  name: string;
  tin?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  work_start?: string;
  work_end?: string;
  logo_url?: string;
}

export const clinicSettingsApi = {
  get: () =>
    api.get<any>('/clinic-settings', true),

  update: (dto: UpdateClinicSettingsDto) =>
    api.patch<any>('/clinic-settings', dto, true),
};
