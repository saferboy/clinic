import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../api/auth.service';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: User | null;
  login: (login: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateProfile: (data: { full_name?: string; email?: string; phone?: string }) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // App yuklanganda tokenlarni tekshirish va user olish
  useEffect(() => {
    const initAuth = async () => {
      const stored = authService.getStoredAuth();
      
      if (stored && stored.user) {
        // Token mavjud, lekin expire bo'lgan bo'lishi mumkin
        // Avval user ma'lumotlarini backend dan olishga harakat qilamiz
        try {
          const user = await authService.getMe();
          setCurrentUser(user);
        } catch (err) {
          // Token expire bo'lgan - refresh qilishga harakat
          try {
            await authService.refreshToken();
            const user = await authService.getMe();
            setCurrentUser(user);
          } catch {
            // Refresh ham muvaffaqiyatsiz - logout
            authService.logout();
            setCurrentUser(null);
          }
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login
  const login = async (login: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await authService.login({ login, password });
      setCurrentUser(user);
      setIsLoading(false);
      toast.success('Muvaffaqiyatli kirdingiz');
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Login yoki parol noto\'g\'ri';
      setError(errorMessage);
      setIsLoading(false);
      toast.error(errorMessage);
      return false;
    }
  };

  // Logout
  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    toast.info('Tizimdan chiqdingiz');
  };

  // Refresh auth
  const refreshAuth = async () => {
    try {
      await authService.refreshToken();
      const user = await authService.getMe();
      setCurrentUser(user);
    } catch (err) {
      console.error('Auth refresh failed:', err);
      throw err;
    }
  };

  // Update profile
  const updateProfile = useCallback(async (data: { full_name?: string; email?: string; phone?: string }) => {
    try {
      const response = await authService.updateProfile(data);
      if (response.success && response.data) {
        const { password, ...userData } = response.data;
        setCurrentUser(userData as User);
        toast.success('Profil yangilandi');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Profil yangilashda xatolik';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    try {
      await authService.changePassword(oldPassword, newPassword);
      toast.success('Parol muvaffaqiyatli o\'zgartirildi');
    } catch (err: any) {
      // Xato xabarini backend dan olish
      const errorMessage = err?.message || err?.data?.message || err?.response?.message || 'Parol o\'zgartirishda xatolik';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, refreshAuth, updateProfile, changePassword, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Role-based access control - backend permissions asosida
export function hasPermission(user: User | null, resource: string, action: string): boolean {
  if (!user) return false;
  
  const permissions = user.role?.permissions;
  
  // SuperAdmin - hamma narsaga ruxsat
  if (permissions?.all === true) return true;
  
  // Specific permission tekshirish
  return permissions?.[resource]?.[action] === true;
}

// Role nomi bo'yicha access control (fallback)
export function hasAccess(roleName: string | undefined, page: string): boolean {
  if (!roleName) return false;
  
  const role = roleName as UserRole;
  
  const access: Record<string, UserRole[]> = {
    dashboard: ['SuperAdmin', 'Admin', 'Doctor', 'Nurse', 'Receptionist', 'Accountant'],
    clients: ['SuperAdmin', 'Admin', 'Doctor', 'Receptionist', 'Accountant'],
    visits: ['SuperAdmin', 'Admin', 'Doctor', 'Nurse', 'Receptionist', 'Accountant'],
    payments: ['SuperAdmin', 'Admin', 'Receptionist', 'Accountant'],
    services: ['SuperAdmin', 'Admin', 'Doctor', 'Accountant'],
    rooms: ['SuperAdmin', 'Admin', 'Doctor', 'Nurse', 'Receptionist'],
    reports: ['SuperAdmin', 'Admin', 'Doctor', 'Receptionist', 'Accountant'],
    settings: ['SuperAdmin', 'Admin'],
    users: ['SuperAdmin', 'Admin'],
  };
  
  return access[page]?.includes(role) ?? false;
}
