'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { AppointmentsList } from '@/components/dashboard/appointments-list';
import { VisitDistributionChart } from '@/components/dashboard/visit-distribution-chart';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

// Mock data for dashboard
const mockChartData = [
  { date: 'Jan', revenue: 4000, visits: 24 },
  { date: 'Feb', revenue: 3000, visits: 18 },
  { date: 'Mar', revenue: 5000, visits: 32 },
  { date: 'Apr', revenue: 4500, visits: 28 },
  { date: 'May', revenue: 6000, visits: 35 },
  { date: 'Jun', revenue: 5500, visits: 31 },
];

const mockAppointments = [
  {
    id: '1',
    clientName: 'Ahmed Khan',
    service: 'Consultation',
    time: '09:30 AM',
    status: 'confirmed' as const,
  },
  {
    id: '2',
    clientName: 'Fatima Ali',
    service: 'Vaccination',
    time: '10:00 AM',
    status: 'confirmed' as const,
  },
  {
    id: '3',
    clientName: 'Hassan Omar',
    service: 'Lab Test',
    time: '11:30 AM',
    status: 'pending' as const,
  },
];

const mockVisitDistribution = [
  { name: 'Consultation', visits: 45 },
  { name: 'Vaccination', visits: 32 },
  { name: 'Lab Tests', visits: 28 },
  { name: 'Dental', visits: 22 },
  { name: 'Physical Therapy', visits: 18 },
];

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back to your clinic management system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Clients"
            value="1,234"
            description="Active clients"
            icon={Users}
            iconColor="bg-blue-100 text-blue-600"
            trend={{ direction: 'up', percentage: 12 }}
          />
          <StatsCard
            title="Appointments Today"
            value="8"
            description="3 pending"
            icon={Calendar}
            iconColor="bg-green-100 text-green-600"
            trend={{ direction: 'up', percentage: 8 }}
          />
          <StatsCard
            title="Total Revenue"
            value="$28,500"
            description="This month"
            icon={DollarSign}
            iconColor="bg-purple-100 text-purple-600"
            trend={{ direction: 'up', percentage: 15 }}
          />
          <StatsCard
            title="Avg. Rating"
            value="4.8"
            description="Out of 5 stars"
            icon={TrendingUp}
            iconColor="bg-yellow-100 text-yellow-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart data={mockChartData} />
          </div>
          <VisitDistributionChart data={mockVisitDistribution} />
        </div>

        {/* Appointments */}
        <AppointmentsList appointments={mockAppointments} />
      </div>
    </ProtectedRoute>
  );
}
