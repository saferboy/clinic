'use client';

import { usePatients } from '@/hooks/use-patients';
import { useDoctors } from '@/hooks/use-doctors';
import { useAppointments } from '@/hooks/use-appointments';
import { StatsCard } from '@/components/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Stethoscope, Calendar, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const appointmentTrendData = [
  { month: 'Jan', appointments: 40, completed: 35 },
  { month: 'Feb', appointments: 45, completed: 42 },
  { month: 'Mar', appointments: 38, completed: 35 },
  { month: 'Apr', appointments: 52, completed: 48 },
  { month: 'May', appointments: 61, completed: 58 },
  { month: 'Jun', appointments: 55, completed: 50 },
];

const departmentData = [
  { name: 'Cardiology', patients: 42 },
  { name: 'Orthopedics', patients: 38 },
  { name: 'Pediatrics', patients: 35 },
  { name: 'Neurology', patients: 28 },
  { name: 'General', patients: 45 },
];

export default function DashboardPage() {
  const { patients, isLoading: patientsLoading } = usePatients();
  const { doctors, isLoading: doctorsLoading } = useDoctors();
  const { appointments, isLoading: appointmentsLoading } = useAppointments();

  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const scheduledAppointments = appointments.filter(a => a.status === 'scheduled').length;

  const isLoading = patientsLoading || doctorsLoading || appointmentsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your clinic management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Patients"
          value={patients.length}
          description="Active patients"
          icon={<Users className="w-8 h-8" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Doctors"
          value={doctors.length}
          description="Available doctors"
          icon={<Stethoscope className="w-8 h-8" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Appointments"
          value={appointments.length}
          description={`${scheduledAppointments} scheduled`}
          icon={<Calendar className="w-8 h-8" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Completed"
          value={completedAppointments}
          description="This month"
          icon={<CheckCircle2 className="w-8 h-8" />}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Trends</CardTitle>
            <CardDescription>Monthly appointment activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={appointmentTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Legend />
                <Line type="monotone" dataKey="appointments" stroke="#0ea5e9" strokeWidth={2} />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patients by Department</CardTitle>
            <CardDescription>Distribution across specializations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Bar dataKey="patients" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Appointments</CardTitle>
          <CardDescription>Latest appointment activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.slice(0, 5).map(apt => (
              <div key={apt.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Appointment #{apt.id}</p>
                  <p className="text-sm text-muted-foreground">{apt.reason} • {apt.date} at {apt.time}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  apt.status === 'completed' 
                    ? 'bg-green-500/20 text-green-400'
                    : apt.status === 'scheduled'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
