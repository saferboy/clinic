'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { MENU_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  Calendar,
  CreditCard,
  Stethoscope,
  Building2,
  BarChart3,
  UserCog,
  Settings,
  FileText,
  User,
  LogOut,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ICON_MAP: Record<string, any> = {
  Home,
  Users,
  Calendar,
  CreditCard,
  Stethoscope,
  Building2,
  BarChart3,
  UserCog,
  Settings,
  FileText,
  User,
};

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const menuItems = MENU_ITEMS[user.role] || [];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out',
        !isOpen && '-translate-x-full'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-6">
        <h1 className="text-xl font-bold text-gray-900">Clinic</h1>
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = ICON_MAP[item.icon] || Home;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-gray-700"
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
