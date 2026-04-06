import { createBrowserRouter, Navigate } from 'react-router';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientsPage } from './pages/ClientsPage';
import { VisitsPage } from './pages/VisitsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ServicesPage } from './pages/ServicesPage';
import { RoomsPage } from './pages/RoomsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: DashboardLayout,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', Component: DashboardPage },
      { path: 'clients', Component: ClientsPage },
      { path: 'visits', Component: VisitsPage },
      { path: 'payments', Component: PaymentsPage },
      { path: 'services', Component: ServicesPage },
      { path: 'rooms', Component: RoomsPage },
      { path: 'reports', Component: ReportsPage },
      { path: 'settings', Component: SettingsPage },
      { path: 'users', Component: UsersPage },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
