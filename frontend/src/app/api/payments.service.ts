import { api } from './client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type BackendPaymentType = 'INCOME' | 'OUTCOME';

export interface BackendPayment {
  id: number;
  payment_type: BackendPaymentType;
  amount: string; // Decimal comes as string from Prisma
  description: string | null;
  payment_date: string;
  client_id: number | null;
  visit_id: number | null;
  user_id: number | null;
  registered_by: number | null;
  created_at: string;
  client?: { id: number; full_name: string; phone: string } | null;
  register_user?: { id: number; full_name: string } | null;
}

export interface PaymentSummary {
  totalIncome: number;
  totalOutcome: number;
  netBalance: number;
  count: number;
  by_type?: {
    payment: { income: number; outcome: number };
    client_paid: { income: number; outcome: number };
    other_paid: { income: number; outcome: number };
  };
}

export interface BackendClientPaid {
  id: number;
  client_id: number | null;
  visit_id: number | null;
  amount: string;
  description: string | null;
  payment_date: string;
  client?: { id: number; full_name: string; phone: string } | null;
}

export interface OtherPaidGroup {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface BackendOtherPaid {
  id: number;
  type: BackendPaymentType;
  amount: string;
  description: string | null;
  payment_date: string;
  group_id: number | null;
  group?: OtherPaidGroup | null;
}

export const paymentsApi = {
  // Payment
  getPayments: (params?: {
    payment_type?: string;
    client_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.payment_type) q.set('payment_type', params.payment_type);
    if (params?.client_id) q.set('client_id', String(params.client_id));
    if (params?.date_from) q.set('date_from', params.date_from);
    if (params?.date_to) q.set('date_to', params.date_to);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return api.get<ApiResponse<{ data: BackendPayment[]; total: number; page: number; totalPages: number }>>(
      `/payments?${q}`,
      true,
    );
  },

  getSummary: (date_from?: string, date_to?: string) => {
    const q = new URLSearchParams();
    if (date_from) q.set('date_from', date_from);
    if (date_to) q.set('date_to', date_to);
    return api.get<ApiResponse<PaymentSummary>>(`/payments/summary?${q}`, true);
  },

  createPayment: (body: {
    payment_type: BackendPaymentType;
    amount: number;
    description?: string;
    client_id?: number;
    visit_id?: number;
    payment_date?: string;
  }) => api.post<ApiResponse<BackendPayment>>('/payments', body, true),

  deletePayment: (id: number) =>
    api.delete<ApiResponse<null>>(`/payments/${id}`, true),

  // ClientPaid
  getClientPaid: (params?: {
    client_id?: number;
    visit_id?: number;
    page?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.client_id) q.set('client_id', String(params.client_id));
    if (params?.visit_id) q.set('visit_id', String(params.visit_id));
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return api.get<ApiResponse<{ data: BackendClientPaid[]; total: number }>>(
      `/client-paid?${q}`,
      true,
    );
  },

  createClientPaid: (body: {
    client_id: number;
    amount: number;
    visit_id?: number;
    description?: string;
  }) => api.post<ApiResponse<BackendClientPaid>>('/client-paid', body, true),

  deleteClientPaid: (id: number) =>
    api.delete<ApiResponse<null>>(`/client-paid/${id}`, true),

  // OtherPaidGroups
  getOtherPaidGroups: () =>
    api.get<ApiResponse<OtherPaidGroup[]>>('/other-paid-groups', true),

  createOtherPaidGroup: (body: { name: string; description?: string }) =>
    api.post<ApiResponse<OtherPaidGroup>>('/other-paid-groups', body, true),

  updateOtherPaidGroup: (id: number, body: { name?: string; description?: string }) =>
    api.patch<ApiResponse<OtherPaidGroup>>(`/other-paid-groups/${id}`, body, true),

  deleteOtherPaidGroup: (id: number) =>
    api.delete<ApiResponse<null>>(`/other-paid-groups/${id}`, true),

  // OtherPaid
  getOtherPaid: (params?: {
    type?: string;
    group_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set('type', params.type);
    if (params?.group_id) q.set('group_id', String(params.group_id));
    if (params?.date_from) q.set('date_from', params.date_from);
    if (params?.date_to) q.set('date_to', params.date_to);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return api.get<ApiResponse<{ data: BackendOtherPaid[]; total: number }>>(
      `/other-paid?${q}`,
      true,
    );
  },

  createOtherPaid: (body: {
    type: BackendPaymentType;
    amount: number;
    group_id?: number;
    description?: string;
  }) => api.post<ApiResponse<BackendOtherPaid>>('/other-paid', body, true),

  deleteOtherPaid: (id: number) =>
    api.delete<ApiResponse<null>>(`/other-paid/${id}`, true),
};
