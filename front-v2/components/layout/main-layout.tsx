'use client';

import { useState, ReactNode, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Overlay for mobile */}
      {isClient && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300 ease-in-out',
          isClient && sidebarOpen ? 'ml-64' : 'ml-0'
        )}
      >
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
