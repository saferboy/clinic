import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Klinika umumiy ko\'rinishi' },
  '/clients': { title: 'Mijozlar', subtitle: 'Barcha mijozlar ro\'yxati' },
  '/visits': { title: 'Tashriflar', subtitle: 'Bemorlar tashriflari' },
  '/payments': { title: 'To\'lovlar', subtitle: 'Moliyaviy operatsiyalar' },
  '/services': { title: 'Xizmatlar', subtitle: 'Tibbiy xizmatlar va narxlar' },
  '/rooms': { title: 'Xonalar', subtitle: 'Xonalar holati va boshqaruvi' },
  '/reports': { title: 'Hisobotlar', subtitle: 'Statistika va tahlil' },
  '/settings': { title: 'Sozlamalar', subtitle: 'Tizim sozlamalari' },
  '/users': { title: 'Foydalanuvchilar', subtitle: 'Xodimlar va ruxsatlar' },
};

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const pageInfo = pageTitles[location.pathname] || { title: 'Sahifa' };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onMenuClick={() => setMobileOpen(true)}
          darkMode={darkMode}
          onDarkModeToggle={() => setDarkMode(!darkMode)}
        />
        <main className="flex-1 p-4 md:p-6 bg-[#f5f6fa] dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
