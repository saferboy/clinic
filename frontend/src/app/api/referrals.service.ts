import { api } from './client';

export interface Referral {
  id: number;
  full_name: string;
  phone: string | null;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
  _count?: { visit_referrals: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ReferralsListResponse {
  success: boolean;
  message: string;
  data: Referral[];
  pagination: Pagination;
}

interface ReferralResponse {
  success: boolean;
  message: string;
  data: Referral;
}

export interface ReferralsQuery {
  page?: number;
  limit?: number;
  full_name?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const referralsApi = {
  findMany: (query?: ReferralsQuery) => {
    const p = new URLSearchParams();
    if (query?.page) p.set('page', String(query.page));
    if (query?.limit) p.set('limit', String(query.limit));
    if (query?.full_name) p.set('full_name', query.full_name);
    if (query?.phone) p.set('phone', query.phone);
    if (query?.status) p.set('status', query.status);
    if (query?.sortBy) p.set('sortBy', query.sortBy);
    if (query?.sortOrder) p.set('sortOrder', query.sortOrder);
    return api.get<ReferralsListResponse>(`/referrals?${p}`, true);
  },

  findAll: () =>
    api.get<ReferralsListResponse>('/referrals?limit=100&sortBy=full_name&sortOrder=asc', true),

  create: (dto: { full_name: string; phone?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) =>
    api.post<ReferralResponse>('/referrals', dto, true),

  update: (id: number, dto: { full_name?: string; phone?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) =>
    api.patch<ReferralResponse>(`/referrals/${id}`, dto, true),

  remove: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/referrals/${id}`, true),

  getStatistics: () =>
    api.get<{ success: boolean; message: string; data: Array<{ referral_id: number; full_name: string; phone: string | null; visit_count: number }> }>('/referrals/statistics', true),
};
