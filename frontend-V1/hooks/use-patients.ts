'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/lib/types';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching patients from API
    const timer = setTimeout(() => {
      const mockPatients: Patient[] = [
        {
          id: '1',
          name: 'John Doe',
          phone: '555-0001',
          dateOfBirth: '1990-01-15',
          gender: 'male',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Jane Smith',
          phone: '555-0002',
          dateOfBirth: '1985-05-20',
          gender: 'female',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Robert Johnson',
          phone: '555-0003',
          dateOfBirth: '1995-03-10',
          gender: 'male',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setPatients(mockPatients);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { patients, isLoading, error };
}
