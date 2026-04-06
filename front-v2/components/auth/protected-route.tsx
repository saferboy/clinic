'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Use a small delay to ensure hydration is complete before accessing localStorage
    const timer = setTimeout(() => {
      // Check if user is authenticated
      if (!user && !token) {
        const storedToken = localStorage.getItem('authToken');
        if (!storedToken) {
          router.push('/login');
          return;
        }
      }

      // Check if user has required role
      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }

      setIsAuthorized(true);
    }, 0);

    return () => clearTimeout(timer);
  }, [user, token, allowedRoles, router]);

  // Show loading state while checking auth
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen" suppressHydrationWarning>
        <div className="animate-spin h-8 w-8 text-blue-600 border-4 border-gray-200 rounded-full border-t-blue-600" suppressHydrationWarning></div>
      </div>
    );
  }

  return <>{children}</>;
}
