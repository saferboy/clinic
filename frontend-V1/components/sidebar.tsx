'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BarChart3, Users, Stethoscope, Calendar, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    href: '/patients',
    label: 'Patients',
    icon: <Users className="w-5 h-5" />,
  },
  {
    href: '/doctors',
    label: 'Doctors',
    icon: <Stethoscope className="w-5 h-5" />,
  },
  {
    href: '/appointments',
    label: 'Appointments',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    href: '/users',
    label: 'Users',
    icon: <Settings className="w-5 h-5" />,
    roles: ['admin'],
  },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const visibleItems = navItems.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-screen w-64 bg-sidebar border-r border-sidebar-border z-40 transition-transform md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">Clinic Pro</h1>
        </div>

        <nav className="p-4 space-y-2">
          {visibleItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
            >
              <div
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  pathname === item.href
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile spacer */}
      <div className="h-16 md:hidden" />
    </>
  );
}
