const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  skipAuthRefresh?: boolean; // Refresh token doirasida refresh qilmaslik uchun
}

// Refresh token jarayonini boshqarish uchun flag
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private getDefaultHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'credentials': 'include',
    };
  }

  /**
   * Token refresh - 401 bo'lganda automatic refresh
   */
  private async refreshAccessToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      throw new Error('Refresh token mavjud emas');
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: this.getDefaultHeaders(),
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      if (data.success && data.data) {
        const { accessToken, refreshToken: newRefreshToken } = data.data;

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);

        // Stored auth ni yangilash
        const stored = localStorage.getItem('clinic_auth');
        if (stored) {
          try {
            const authData = JSON.parse(stored);
            authData.accessToken = accessToken;
            authData.refreshToken = newRefreshToken;
            localStorage.setItem('clinic_auth', JSON.stringify(authData));
          } catch (e) {
            console.error('Failed to update stored auth:', e);
          }
        }

        return accessToken;
      }

      throw new Error('Token refresh failed');
    } catch (error) {
      // Refresh muvaffaqiyatsiz - barcha tokenlarni tozalash
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('clinic_auth');
      throw error;
    }
  }

  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      requiresAuth = false,
      skipAuthRefresh = false,
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders: Record<string, string> = {
      ...this.getDefaultHeaders(),
      ...headers,
      ...(requiresAuth ? this.getAuthHeaders() : {}),
    };

    const config: RequestInit = {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    };

    try {
      let response = await fetch(url, config);

      // 401 Unauthorized - token refresh kerak
      if (response.status === 401 && requiresAuth && !skipAuthRefresh) {
        if (isRefreshing) {
          // Agar allaqachon refresh jarayonida bo'lsa, navbatga qo'shish
          return new Promise<T>((resolve, reject) => {
            failedQueue.push({
              resolve: (token: string) => {
                requestHeaders.Authorization = `Bearer ${token}`;
                fetch(url, { ...config, headers: requestHeaders })
                  .then(res => res.json())
                  .then(data => resolve(data as T))
                  .catch(err => reject(err));
              },
              reject,
            });
          });
        }

        isRefreshing = true;

        try {
          const newToken = await this.refreshAccessToken();
          processQueue(null, newToken);

          // Yangi token bilan qayta urinish
          requestHeaders.Authorization = `Bearer ${newToken}`;
          response = await fetch(url, config);
        } catch (refreshError) {
          processQueue(refreshError, null);
          // Login sahifasiga redirect qilish
          window.location.href = '/login';
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const error = new Error(
          errorData?.message || errorData?.error || errorData?.statusCode?.toString() || `HTTP error! status: ${response.status}`
        );
        (error as any).status = response.status;
        (error as any).data = errorData;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  get<T>(endpoint: string, requiresAuth: boolean = false) {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  post<T>(endpoint: string, body?: unknown, requiresAuth: boolean = false) {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth });
  }

  put<T>(endpoint: string, body?: unknown, requiresAuth: boolean = false) {
    return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth });
  }

  patch<T>(endpoint: string, body?: unknown, requiresAuth: boolean = false) {
    return this.request<T>(endpoint, { method: 'PATCH', body, requiresAuth });
  }

  delete<T>(endpoint: string, requiresAuth: boolean = false) {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  }
}

export const api = new ApiClient(API_BASE_URL);
