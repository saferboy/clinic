import { api } from './client';
import type {
  BackendLoginResponse,
  BackendRefreshTokenResponse,
  BackendUserResponse,
  LoginCredentials,
  AuthUser,
  StoredAuth,
} from './auth.types';

const STORAGE_KEY = 'clinic_auth';

/**
 * Auth service - Backend JWT auth bilan ishlash
 */
export const authService = {
  /**
   * Login - foydalanuvchini autentifikatsiya qilish
   */
  async login(credentials: LoginCredentials) {
    const response = await api.post<BackendLoginResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      const { user, accessToken, refreshToken } = response.data;
      
      // Frontend format ga o'girish
      const authUser: AuthUser = {
        id: user.id,
        fullName: user.full_name,
        login: user.login,
        email: user.email,
        phone: user.phone,
        role: user.role,
      };
      
      // Tokenlarni saqlash
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        accessToken,
        refreshToken,
        user: authUser,
      }));
      
      return authUser;
    }
    
    throw new Error(response.message || 'Login failed');
  },

  /**
   * Refresh token - access token yangilash
   */
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('Refresh token topilmadi');
    }
    
    try {
      const response = await api.post<BackendRefreshTokenResponse>('/auth/refresh', {
        refreshToken,
      });
      
      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
        
        // Stored auth ni yangilash
        const stored = this.getStoredAuth();
        if (stored) {
          stored.accessToken = accessToken;
          stored.refreshToken = newRefreshToken;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        }
        
        return { accessToken, refreshToken: newRefreshToken };
      }
      
      throw new Error('Token refresh failed');
    } catch (error) {
      // Refresh muvaffaqiyatsiz - logout qilish
      this.logout();
      throw error;
    }
  },

  /**
   * Logout - foydalanuvchini chiqarish
   */
  async logout() {
    try {
      // Backend ga logout bildirish (optional, error bo'lsa ham local storage tozalanadi)
      await api.post('/auth/logout', undefined, true);
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Local storage tozalash
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  /**
   * Get current user profile - /auth/me
   */
  async getMe() {
    const response = await api.get<BackendUserResponse>('/auth/me', true);
    
    if (response.success && response.data) {
      const user = response.data;
      
      const authUser: AuthUser = {
        id: user.id,
        fullName: user.full_name,
        login: user.login,
        email: user.email,
        phone: user.phone,
        role: user.role || {
          id: 0,
          name: 'unknown',
          permissions: {},
        },
      };
      
      return authUser;
    }
    
    throw new Error('Failed to get user profile');
  },

  /**
   * Saqlangan auth ma'lumotlarini olish
   */
  getStoredAuth(): StoredAuth | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored) as StoredAuth;
    } catch {
      return null;
    }
  },

  /**
   * Access token olish
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  /**
   * Refresh token olish
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },

  /**
   * Auth holatini tekshirish (token mavjudmi)
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string) {
    return api.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    }, true);
  },

  /**
   * Update profile - Profil ma'lumotlarini yangilash
   */
  async updateProfile(data: { full_name?: string; email?: string; phone?: string }) {
    return api.put<BackendUserResponse>('/auth/profile', data, true);
  },
};
