import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { mockUsers } from '../mockData';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('clinic_user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('clinic_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    // Mock auth - any user from mockUsers with password "123456" works
    // or email "admin@clinic.uz" with any password for quick login
    const user = mockUsers.find(u => u.email === email) || 
                 (email === '' ? mockUsers[0] : null);
    if (user && (password === '123456' || password === 'admin123')) {
      setCurrentUser(user);
      localStorage.setItem('clinic_user', JSON.stringify(user));
      setIsLoading(false);
      return true;
    }
    // Allow demo login with any credentials
    if (email && password) {
      const demoUser = mockUsers[0]; // default admin
      setCurrentUser(demoUser);
      localStorage.setItem('clinic_user', JSON.stringify(demoUser));
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('clinic_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function hasAccess(role: UserRole, page: string): boolean {
  const access: Record<string, UserRole[]> = {
    dashboard: ['admin', 'doctor', 'nurse', 'receptionist', 'accountant'],
    clients: ['admin', 'doctor', 'receptionist', 'accountant'],
    visits: ['admin', 'doctor', 'nurse', 'receptionist', 'accountant'],
    payments: ['admin', 'receptionist', 'accountant'],
    services: ['admin', 'doctor', 'accountant'],
    rooms: ['admin', 'doctor', 'nurse', 'receptionist'],
    reports: ['admin', 'doctor', 'receptionist', 'accountant'],
    settings: ['admin'],
    users: ['admin'],
  };
  return access[page]?.includes(role) ?? false;
}
