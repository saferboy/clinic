'use client';

import { useState } from 'react';
import { useAppointments } from '@/hooks/use-appointments';
import { usePatients } from '@/hooks/use-patients';
import { useDoctors } from '@/hooks/use-doctors';
import { Appointment } from '@/lib/types';
import { AppointmentModal } from '@/components/appointment-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Calendar } from 'lucide-react';

export default function AppointmentsPage() {
  const { appointments, isLoading: appointmentsLoading } = useAppointments();
  const { patients, isLoading: patientsLoading } = usePatients();
  const { doctors, isLoading: doctorsLoading } = useDoctors();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>(appointments);

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'Unknown';
  const getDoctorName = (id: string) => doctors.find(d => d.id === id)?.name || 'Unknown';

  let filteredAppointments = appointmentsList.filter(apt => {
    const matchesSearch = 
      getPatientName(apt.patientId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDoctorName(apt.doctorId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddAppointment = (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAppointment: Appointment = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAppointmentsList([...appointmentsList, newAppointment]);
    setEditingAppointment(undefined);
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointmentsList(appointmentsList.filter(a => a.id !== id));
  };

  const handleEditClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAppointment(undefined);
  };

  const isLoading = appointmentsLoading || patientsLoading || doctorsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <div className="h-64 bg-card rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage appointments</p>
        </div>
        <Button 
          onClick={() => {
            setEditingAppointment(undefined);
            setIsModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Appointment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter appointments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient, doctor, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointment List</CardTitle>
          <CardDescription>{filteredAppointments.length} appointments found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground">No appointments found</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-card/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          {getPatientName(appointment.patientId)} • {getDoctorName(appointment.doctorId)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.date} at {appointment.time}
                      </p>
                      {appointment.notes && (
                        <p className="text-xs text-muted-foreground italic">Note: {appointment.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${
                        appointment.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400'
                          : appointment.status === 'scheduled'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(appointment)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddAppointment}
        initialData={editingAppointment}
        patients={patients}
        doctors={doctors}
        title={editingAppointment ? 'Edit Appointment' : 'New Appointment'}
      />
    </div>
  );
}
