import { Bell, Search, Moon, Sun, Menu, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getStatusLabel } from '../../mockData';
import { useNavigate } from 'react-router';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  darkMode: boolean;
  onDarkModeToggle: () => void;
}

const notifications = [
  { id: 1, text: "Bahodir Yuldashev bugun 10:00 da", type: 'visit', time: '5 daqiqa oldin' },
  { id: 2, text: "Sherzod Ergashev - 200,000 so'm qarz", type: 'debt', time: '1 soat oldin' },
  { id: 3, text: "5-xona ta'mirga chiqdi", type: 'room', time: '2 soat oldin' },
];

export function Header({ title, subtitle, onMenuClick, darkMode, onDarkModeToggle }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-16 border-b border-border bg-background flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-xs mt-0">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-sm text-muted-foreground cursor-pointer hover:bg-accent transition-colors">
          <Search size={15} />
          <span className="text-xs">Qidirish</span>
          <kbd className="text-xs bg-background border border-border rounded px-1 py-0.5 ml-1">⌘K</kbd>
        </div>

        {/* Dark mode */}
        <button
          onClick={onDarkModeToggle}
          className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowUser(false); }}
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground relative"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="p-3 border-b border-border">
                <h3 className="text-sm font-medium">Bildirishnomalar</h3>
              </div>
              {notifications.map(n => (
                <div key={n.id} className="p-3 border-b border-border hover:bg-accent cursor-pointer transition-colors">
                  <p className="text-sm">{n.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                </div>
              ))}
              <div className="p-2 text-center">
                <button className="text-xs text-blue-600 hover:underline">Hammasini ko'rish</button>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                {(currentUser.fullName || currentUser.login).charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-medium text-foreground">{(currentUser.fullName || currentUser.login).split(' ')[0]}</div>
                <div className="text-xs text-muted-foreground">{getStatusLabel(currentUser.role?.name)}</div>
              </div>
              <ChevronDown size={14} className="text-muted-foreground hidden md:block" />
            </button>

            {showUser && (
              <div className="absolute right-0 top-12 w-48 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-medium">{currentUser.fullName || currentUser.login}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email || '-'}</p>
                </div>
                <button
                  onClick={() => { navigate('/settings'); setShowUser(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  Profil sozlamalari
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Chiqish
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay to close dropdowns */}
      {(showNotif || showUser) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowNotif(false); setShowUser(false); }}
        />
      )}
    </header>
  );
}
