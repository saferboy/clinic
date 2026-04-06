const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...requestOptions } = options;

  const headers = new Headers(requestOptions.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      headers.set('Authorization', `Bearer ${storedToken}`);
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log("[v0] API call:", { url, method: requestOptions.method || 'GET' });

  try {
    const response = await fetch(url, {
      ...requestOptions,
      headers,
    });

    console.log("[v0] API response status:", response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json() as Promise<T>;
  } catch (err) {
    console.log("[v0] API error caught:", err);
    throw err;
  }
}

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiCall('/auth/logout', {
      method: 'POST',
    }),

  getCurrentUser: () =>
    apiCall('/auth/me', {
      method: 'GET',
    }),

  register: (name: string, email: string, password: string) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
};

// Clients endpoints
export const clientAPI = {
  list: (params?: Record<string, unknown>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, String(value));
      });
    }
    return apiCall(`/clients?${query.toString()}`, { method: 'GET' });
  },

  get: (id: string) =>
    apiCall(`/clients/${id}`, {
      method: 'GET',
    }),

  create: (data: unknown) =>
    apiCall('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: unknown) =>
    apiCall(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiCall(`/clients/${id}`, {
      method: 'DELETE',
    }),
};

// Visits endpoints
export const visitAPI = {
  list: (params?: Record<string, unknown>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, String(value));
      });
    }
    return apiCall(`/visits?${query.toString()}`, { method: 'GET' });
  },

  get: (id: string) =>
    apiCall(`/visits/${id}`, {
      method: 'GET',
    }),

  create: (data: unknown) =>
    apiCall('/visits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: unknown) =>
    apiCall(`/visits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  cancel: (id: string) =>
    apiCall(`/visits/${id}/cancel`, {
      method: 'POST',
    }),
};

// Payments endpoints
export const paymentAPI = {
  list: (params?: Record<string, unknown>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, String(value));
      });
    }
    return apiCall(`/payments?${query.toString()}`, { method: 'GET' });
  },

  get: (id: string) =>
    apiCall(`/payments/${id}`, {
      method: 'GET',
    }),

  create: (data: unknown) =>
    apiCall('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: unknown) =>
    apiCall(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Services endpoints
export const serviceAPI = {
  list: () =>
    apiCall('/services', {
      method: 'GET',
    }),

  get: (id: string) =>
    apiCall(`/services/${id}`, {
      method: 'GET',
    }),

  create: (data: unknown) =>
    apiCall('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: unknown) =>
    apiCall(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Rooms endpoints
export const roomAPI = {
  list: () =>
    apiCall('/rooms', {
      method: 'GET',
    }),

  get: (id: string) =>
    apiCall(`/rooms/${id}`, {
      method: 'GET',
    }),

  create: (data: unknown) =>
    apiCall('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: unknown) =>
    apiCall(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Reports endpoints
export const reportAPI = {
  getDashboard: () =>
    apiCall('/reports/dashboard', {
      method: 'GET',
    }),

  getVisits: (params?: Record<string, unknown>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, String(value));
      });
    }
    return apiCall(`/reports/visits?${query.toString()}`, { method: 'GET' });
  },

  getPayments: (params?: Record<string, unknown>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, String(value));
      });
    }
    return apiCall(`/reports/payments?${query.toString()}`, { method: 'GET' });
  },
};
