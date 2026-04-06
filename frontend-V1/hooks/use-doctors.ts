'use client';

import { useState, useEffect } from 'react';
import { Doctor } from '@/lib/types';

export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching doctors from API
    const timer = setTimeout(() => {
      const mockDoctors: Doctor[] = [
        {
          id: '1',
          name: 'Dr. Emily Brown',
          phone: '555-1001',
          specialization: 'Cardiology',
          licenseNumber: 'MD001234',
          availability: ['Monday', 'Wednesday', 'Friday'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Dr. Michael Chen',
          phone: '555-1002',
          specialization: 'Orthopedics',
          licenseNumber: 'MD001235',
          availability: ['Tuesday', 'Thursday', 'Saturday'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Dr. Sarah Wilson',
          phone: '555-1003',
          specialization: 'Pediatrics',
          licenseNumber: 'MD001236',
          availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setDoctors(mockDoctors);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { doctors, isLoading, error };
}
