import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * AuthGuard - Faqat authenticated userlar uchun route protection
 */
interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  // Loading holatida - hali auth tekshirilmoqda
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-blue-600" />
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Authenticated emas - login ga redirect
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated - children render qilinadi
  return <>{children}</>;
}

/**
 * GuestGuard - Faqat unauthenticated userlar uchun (login sahifasi)
 * Agar user already authenticated bo'lsa, dashboard ga redirect qilinadi
 */
interface GuestGuardProps {
  children: ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  // Loading holatida
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-blue-600" />
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Already authenticated - dashboard ga redirect
  if (currentUser) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Not authenticated - login render qilinadi
  return <>{children}</>;
}
