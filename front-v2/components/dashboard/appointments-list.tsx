'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed';
}

interface AppointmentsListProps {
  appointments: Appointment[];
}

const statusColors = {
  confirmed: { bg: 'bg-green-100', text: 'text-green-800' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-800' },
};

export function AppointmentsList({ appointments }: AppointmentsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Appointments</CardTitle>
        <CardDescription>Upcoming appointments for today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <p className="text-sm text-gray-500">No appointments scheduled for today</p>
          ) : (
            appointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{apt.clientName}</p>
                      <p className="text-xs text-gray-500">{apt.service}</p>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock className="h-4 w-4" />
                    {apt.time}
                  </div>
                  <Badge
                    className={`capitalize ${statusColors[apt.status].bg} ${statusColors[apt.status].text}`}
                    variant="secondary"
                  >
                    {apt.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
