'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Visit } from '@/lib/types';
import { VISIT_STATUSES } from '@/lib/constants';
import { useState } from 'react';

// Mock services data
const mockServices = [
  { id: '1', name: 'Consultation' },
  { id: '2', name: 'Vaccination' },
  { id: '3', name: 'Lab Test' },
];

// Mock doctors data
const mockDoctors = [
  { id: '1', name: 'Dr. Smith' },
  { id: '2', name: 'Dr. Johnson' },
];

// Mock rooms data
const mockRooms = [
  { id: '1', name: 'Room A' },
  { id: '2', name: 'Room B' },
];

const visitSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  serviceId: z.string().min(1, 'Service is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  roomId: z.string().optional(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  duration: z.string(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no-show']),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
});

type VisitFormValues = z.infer<typeof visitSchema>;

interface VisitFormProps {
  initialData?: Visit;
  clients: Array<{ id: string; firstName: string; lastName: string }>;
  onSubmit: (data: VisitFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function VisitForm({
  initialData,
  clients,
  onSubmit,
  isLoading,
}: VisitFormProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<VisitFormValues>({
    resolver: zodResolver(visitSchema),
    defaultValues: initialData
      ? {
          clientId: initialData.clientId,
          serviceId: initialData.serviceId,
          doctorId: initialData.doctorId,
          roomId: initialData.roomId || '',
          appointmentDate: initialData.appointmentDate.toString().split('T')[0],
          appointmentTime: initialData.appointmentTime,
          duration: initialData.duration.toString(),
          status: initialData.status,
          notes: initialData.notes || '',
          diagnosis: initialData.diagnosis || '',
          prescription: initialData.prescription || '',
        }
      : {
          clientId: '',
          serviceId: '',
          doctorId: '',
          roomId: '',
          appointmentDate: '',
          appointmentTime: '',
          duration: '30',
          status: 'scheduled',
          notes: '',
          diagnosis: '',
          prescription: '',
        },
  });

  async function handleSubmit(values: VisitFormValues) {
    try {
      setError(null);
      await onSubmit(values);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save visit';
      setError(errorMessage);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Visit' : 'Schedule New Visit'}</CardTitle>
        <CardDescription>
          {initialData ? 'Update visit information' : 'Create a new appointment for a client'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
            )}

            {/* Appointment Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.firstName} {client.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockServices.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockDoctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || ''}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select room" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockRooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min="15" step="15" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VISIT_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medical Notes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="General notes about the visit..."
                          {...field}
                          disabled={isLoading}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Medical diagnosis..."
                          {...field}
                          disabled={isLoading}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prescription (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Medications and dosage..."
                          {...field}
                          disabled={isLoading}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Saving...' : 'Save Visit'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
