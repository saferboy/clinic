'use client';

import { useState, useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Filter } from 'lucide-react';

// Mock data for reports
const visitsByMonth = [
  { month: 'January', visits: 45, revenue: 4500 },
  { month: 'February', visits: 52, revenue: 5200 },
  { month: 'March', visits: 48, revenue: 4800 },
  { month: 'April', visits: 61, revenue: 6100 },
  { month: 'May', visits: 55, revenue: 5500 },
  { month: 'June', visits: 67, revenue: 6700 },
];

const serviceDistribution = [
  { name: 'Consultation', value: 120, revenue: 12000 },
  { name: 'Vaccination', value: 85, revenue: 4250 },
  { name: 'Lab Tests', value: 95, revenue: 7125 },
  { name: 'Physical Therapy', value: 60, revenue: 4800 },
  { name: 'Dental', value: 55, revenue: 4125 },
];

const revenueByPaymentMethod = [
  { method: 'Cash', revenue: 12000 },
  { method: 'Card', revenue: 15000 },
  { method: 'Transfer', revenue: 9500 },
  { method: 'Insurance', revenue: 8000 },
];

const clientsDemographics = [
  { age: '0-18', count: 45 },
  { age: '19-35', count: 120 },
  { age: '36-50', count: 95 },
  { age: '50+', count: 85 },
];

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
];

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('6months');

  const stats = useMemo(() => {
    const totalVisits = visitsByMonth.reduce((sum, m) => sum + m.visits, 0);
    const totalRevenue = visitsByMonth.reduce((sum, m) => sum + m.revenue, 0);
    const averageVisitsPerMonth = Math.round(totalVisits / visitsByMonth.length);
    const averageRevenuePerMonth = Math.round(totalRevenue / visitsByMonth.length);
    const totalClients = clientsDemographics.reduce((sum, d) => sum + d.count, 0);

    return {
      totalVisits,
      totalRevenue,
      averageVisitsPerMonth,
      averageRevenuePerMonth,
      totalClients,
    };
  }, []);

  const handleExportPDF = () => {
    alert('Exporting report as PDF...');
  };

  const handleExportExcel = () => {
    alert('Exporting report as Excel...');
  };

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">Comprehensive clinic performance and statistics</p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600">Total Visits</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalVisits}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.averageVisitsPerMonth} visits/month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ${stats.averageRevenuePerMonth.toLocaleString()}/month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalClients}</p>
              <p className="text-xs text-gray-500 mt-1">Active clients</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600">Avg. Visit Value</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                ${Math.round(stats.totalRevenue / stats.totalVisits).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per visit</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">78%</p>
              <p className="text-xs text-gray-500 mt-1">Visits to revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList>
            <TabsTrigger value="revenue">Revenue & Visits</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="payments">Payment Methods</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
          </TabsList>

          {/* Revenue & Visits Chart */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Visits Trend</CardTitle>
                <CardDescription>Monthly revenue and visit volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={visitsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                      name="Revenue ($)"
                    />
                    <Line
                      type="monotone"
                      dataKey="visits"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                      yAxisId="right"
                      name="Visits"
                    />
                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Chart */}
          <TabsContent value="services">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Service Distribution</CardTitle>
                  <CardDescription>Visits by service type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={serviceDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} (${value})`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {serviceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Service</CardTitle>
                  <CardDescription>Service revenue contribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={serviceDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                        }}
                      />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Methods Chart */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Payment Method</CardTitle>
                <CardDescription>Income distribution across payment channels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenueByPaymentMethod}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="method" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                      }}
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Demographics */}
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Client Demographics</CardTitle>
                <CardDescription>Age group distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={clientsDemographics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="age" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
