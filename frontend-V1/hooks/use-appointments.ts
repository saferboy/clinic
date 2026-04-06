'use client';

import { useState, useEffect } from 'react';
import { Appointment } from '@/lib/types';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching appointments from API
    const timer = setTimeout(() => {
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          patientId: '1',
          doctorId: '1',
          date: '2024-04-10',
          time: '10:00',
          reason: 'Regular Checkup',
          status: 'scheduled',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          patientId: '2',
          doctorId: '2',
          date: '2024-04-11',
          time: '14:00',
          reason: 'Knee Pain',
          status: 'scheduled',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          patientId: '3',
          doctorId: '3',
          date: '2024-04-09',
          time: '15:30',
          reason: 'Vaccination',
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setAppointments(mockAppointments);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { appointments, isLoading, error };
}
