import { NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, Users, Calendar, CreditCard, BarChart3,
  Settings, UserCog, LogOut, Building2, Stethoscope, ChevronLeft, ChevronRight,
  BedDouble, Wrench, Menu, X, UsersRound
} from 'lucide-react';
import { useAuth, hasAccess } from '../../contexts/AuthContext';
import { getStatusLabel } from '../../mockData';
import { useState } from 'react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  page: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, page: 'dashboard' },
  { label: 'Mijozlar', path: '/clients', icon: <Users size={20} />, page: 'clients' },
  { label: 'Mijoz guruhlari', path: '/client-groups', icon: <UsersRound size={20} />, page: 'client-groups' },
  { label: 'Tashriflar', path: '/visits', icon: <Calendar size={20} />, page: 'visits' },
  { label: 'To\'lovlar', path: '/payments', icon: <CreditCard size={20} />, page: 'payments' },
  { label: 'Xizmatlar', path: '/services', icon: <Stethoscope size={20} />, page: 'services' },
  { label: 'Xonalar', path: '/rooms', icon: <BedDouble size={20} />, page: 'rooms' },
  { label: 'Bo\'limlar', path: '/departments', icon: <Wrench size={20} />, page: 'departments' },
  { label: 'Hisobotlar', path: '/reports', icon: <BarChart3 size={20} />, page: 'reports' },
  { label: 'Sozlamalar', path: '/settings', icon: <Settings size={20} />, page: 'settings' },
  { label: 'Foydalanuvchilar', path: '/users', icon: <UserCog size={20} />, page: 'users' },
];

const roleColors: Record<string, string> = {
  SuperAdmin: 'bg-purple-500',
  Admin: 'bg-red-500',
  Doctor: 'bg-blue-500',
  Nurse: 'bg-pink-500',
  Receptionist: 'bg-green-500',
  Accountant: 'bg-amber-500',
  // Fallback uchun kichik nomlar
  admin: 'bg-red-500',
  doctor: 'bg-blue-500',
  nurse: 'bg-pink-500',
  receptionist: 'bg-green-500',
  accountant: 'bg-amber-500',
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter(item =>
    currentUser ? hasAccess(currentUser.role?.name, item.page) : false
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-slate-700/50 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
          <Building2 size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-semibold text-sm leading-tight">MedClinic</div>
            <div className="text-slate-400 text-xs">Boshqaruv tizimi</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {filteredNav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `flex items-center gap-3 mx-2 mb-0.5 px-3 py-2.5 rounded-lg transition-all text-sm ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              } ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      {currentUser && (
        <div className={`p-3 border-t border-slate-700/50 ${collapsed ? '' : ''}`}>
          <div className={`flex items-center gap-3 mb-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className={`w-8 h-8 rounded-full ${roleColors[currentUser.role?.name] || 'bg-slate-600'} flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold`}>
              {(currentUser.fullName || currentUser.login).charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-white text-xs font-medium truncate">{currentUser.fullName || currentUser.login}</div>
                <div className="text-slate-400 text-xs">{getStatusLabel(currentUser.role?.name)}</div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-xs ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={16} />
            {!collapsed && <span>Chiqish</span>}
          </button>
        </div>
      )}

      {/* Collapse button (desktop) */}
      <button
        onClick={onToggle}
        className="hidden md:flex items-center justify-center w-full p-3 text-slate-500 hover:text-white border-t border-slate-700/50 transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 md:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 256 }}>
        <div className="h-full bg-slate-900 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Building2 size={18} className="text-white" />
              </div>
              <span className="text-white font-semibold">MedClinic</span>
            </div>
            <button onClick={onMobileClose} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex flex-col bg-slate-900 h-full transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-16' : 'w-64'}`}
      >
        <SidebarContent />
      </div>
    </>
  );
}
