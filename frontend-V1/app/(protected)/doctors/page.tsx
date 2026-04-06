'use client';

import { useState } from 'react';
import { useDoctors } from '@/hooks/use-doctors';
import { Doctor } from '@/lib/types';
import { DoctorModal } from '@/components/doctor-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function DoctorsPage() {
  const { doctors, isLoading } = useDoctors();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | undefined>();
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(doctors);

  const filteredDoctors = doctorsList.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.phone.includes(searchTerm)
  );

  const handleAddDoctor = (data: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDoctor: Doctor = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDoctorsList([...doctorsList, newDoctor]);
    setEditingDoctor(undefined);
  };

  const handleDeleteDoctor = (id: string) => {
    setDoctorsList(doctorsList.filter(d => d.id !== id));
  };

  const handleEditClick = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(undefined);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Doctors</h1>
        <div className="h-64 bg-card rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctors</h1>
          <p className="text-muted-foreground">Manage doctor profiles</p>
        </div>
        <Button 
          onClick={() => {
            setEditingDoctor(undefined);
            setIsModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Doctor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Doctors</CardTitle>
          <CardDescription>Find doctors by name, specialization, or phone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialization, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Doctor List</CardTitle>
          <CardDescription>{filteredDoctors.length} doctors found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Specialization</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">License</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Availability</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map(doctor => (
                  <tr key={doctor.id} className="border-b border-border hover:bg-card/50 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">{doctor.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{doctor.specialization}</td>
                    <td className="py-3 px-4 text-muted-foreground">{doctor.phone}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs font-mono">{doctor.licenseNumber}</td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {doctor.availability && doctor.availability.length > 0
                        ? doctor.availability.slice(0, 2).join(', ') +
                          (doctor.availability.length > 2 ? '...' : '')
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-right flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(doctor)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDoctor(doctor.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDoctors.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No doctors found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <DoctorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddDoctor}
        initialData={editingDoctor}
        title={editingDoctor ? 'Edit Doctor' : 'Add Doctor'}
      />
    </div>
  );
}
