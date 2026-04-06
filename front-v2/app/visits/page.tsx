'use client';

import { useState, useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { VisitForm } from '@/components/visits/visit-form';
import { VisitsTable } from '@/components/visits/visits-table';
import { VisitsCalendar } from '@/components/visits/visits-calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Visit } from '@/lib/types';
import { Plus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock visits data
const mockVisits: Visit[] = [
  {
    id: '1',
    clientId: '1',
    serviceId: '1',
    doctorId: '1',
    roomId: '1',
    appointmentDate: new Date('2024-04-05'),
    appointmentTime: '09:30',
    duration: 30,
    status: 'completed',
    notes: 'Regular checkup',
    diagnosis: 'No issues found',
    prescription: 'Continue current medications',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    clientId: '2',
    serviceId: '2',
    doctorId: '2',
    roomId: '2',
    appointmentDate: new Date('2024-04-06'),
    appointmentTime: '10:00',
    duration: 15,
    status: 'scheduled',
    notes: 'Vaccination appointment',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    clientId: '3',
    serviceId: '3',
    doctorId: '1',
    appointmentDate: new Date('2024-04-07'),
    appointmentTime: '11:30',
    duration: 45,
    status: 'scheduled',
    notes: 'Lab test follow-up',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock clients data
const mockClients = [
  { id: '1', firstName: 'Ahmed', lastName: 'Khan' },
  { id: '2', firstName: 'Fatima', lastName: 'Ali' },
  { id: '3', firstName: 'Hassan', lastName: 'Omar' },
];

type VisitFormValues = {
  clientId: string;
  serviceId: string;
  doctorId: string;
  roomId?: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  diagnosis?: string;
  prescription?: string;
};

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>(mockVisits);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter visits based on search term and selected date
  const filteredVisits = useMemo(() => {
    let filtered = visits;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((visit) => {
        const clientName = `${mockClients.find((c) => c.id === visit.clientId)?.firstName} ${
          mockClients.find((c) => c.id === visit.clientId)?.lastName
        }`.toLowerCase();
        return (
          clientName.includes(searchLower) ||
          visit.appointmentTime.includes(searchLower)
        );
      });
    }

    // Filter by selected date
    if (selectedDate) {
      filtered = filtered.filter((visit) => {
        const visitDate = new Date(visit.appointmentDate).toDateString();
        const selectedDateString = selectedDate.toDateString();
        return visitDate === selectedDateString;
      });
    }

    // Sort by date and time
    return filtered.sort((a, b) => {
      const dateCompare = new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.appointmentTime.localeCompare(b.appointmentTime);
    });
  }, [visits, searchTerm, selectedDate]);

  const clientNames = useMemo(() => {
    const mapping: Record<string, string> = {};
    mockClients.forEach((client) => {
      mapping[client.id] = `${client.firstName} ${client.lastName}`;
    });
    return mapping;
  }, []);

  const handleAddVisit = async (formData: VisitFormValues) => {
    try {
      setIsLoading(true);

      const newVisit: Visit = {
        id: `${Date.now()}`,
        clientId: formData.clientId,
        serviceId: formData.serviceId,
        doctorId: formData.doctorId,
        roomId: formData.roomId,
        appointmentDate: new Date(formData.appointmentDate),
        appointmentTime: formData.appointmentTime,
        duration: parseInt(formData.duration),
        status: formData.status,
        notes: formData.notes,
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setVisits([...visits, newVisit]);
      setIsFormOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditVisit = async (formData: VisitFormValues) => {
    try {
      setIsLoading(true);

      if (!editingVisit) return;

      const updatedVisit: Visit = {
        ...editingVisit,
        clientId: formData.clientId,
        serviceId: formData.serviceId,
        doctorId: formData.doctorId,
        roomId: formData.roomId,
        appointmentDate: new Date(formData.appointmentDate),
        appointmentTime: formData.appointmentTime,
        duration: parseInt(formData.duration),
        status: formData.status,
        notes: formData.notes,
        diagnosis: formData.diagnosis,
        prescription: formData.prescription,
        updatedAt: new Date(),
      };

      setVisits(
        visits.map((v) => (v.id === editingVisit.id ? updatedVisit : v))
      );
      setEditingVisit(null);
      setIsFormOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVisit = async (id: string) => {
    try {
      setIsLoading(true);
      setVisits(visits.filter((v) => v.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (visit: Visit) => {
    setEditingVisit(visit);
    setIsFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      setEditingVisit(null);
    }
    setIsFormOpen(open);
  };

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visits & Appointments</h1>
            <p className="text-gray-600 mt-2">Manage your clinic schedule and appointments</p>
          </div>

          <Dialog open={isFormOpen} onOpenChange={handleFormOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Schedule Visit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingVisit ? 'Edit Visit' : 'Schedule New Visit'}
                </DialogTitle>
                <DialogDescription>
                  {editingVisit
                    ? 'Update the visit details below'
                    : 'Create a new appointment'}
                </DialogDescription>
              </DialogHeader>
              <VisitForm
                initialData={editingVisit || undefined}
                clients={mockClients}
                onSubmit={editingVisit ? handleEditVisit : handleAddVisit}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <VisitsCalendar
              visits={visits}
              onDateSelect={(date) => setSelectedDate(date)}
            />
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <Card className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by client name or time..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Card>

            {/* Selected date info */}
            {selectedDate && (
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  Showing visits for {selectedDate.toLocaleDateString()}
                  {' '}
                  <button
                    className="ml-2 font-medium text-blue-600 hover:text-blue-700"
                    onClick={() => setSelectedDate(null)}
                  >
                    Clear filter
                  </button>
                </p>
              </div>
            )}

            {/* Visits Table */}
            <VisitsTable
              visits={filteredVisits}
              clientNames={clientNames}
              onEdit={handleEditClick}
              onDelete={handleDeleteVisit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
