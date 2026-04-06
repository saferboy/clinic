'use client';

import { useState } from 'react';
import { usePatients } from '@/hooks/use-patients';
import { Patient } from '@/lib/types';
import { PatientModal } from '@/components/patient-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

export default function PatientsPage() {
  const { patients, isLoading } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>();
  const [patientsList, setPatientsList] = useState<Patient[]>(patients);

  const filteredPatients = patientsList.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const handleAddPatient = (data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPatient: Patient = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPatientsList([...patientsList, newPatient]);
    setEditingPatient(undefined);
  };

  const handleDeletePatient = (id: string) => {
    setPatientsList(patientsList.filter(p => p.id !== id));
  };

  const handleEditClick = (patient: Patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPatient(undefined);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Patients</h1>
        <div className="h-64 bg-card rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground">Manage patient records</p>
        </div>
        <Button 
          onClick={() => {
            setEditingPatient(undefined);
            setIsModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Patients</CardTitle>
          <CardDescription>Find patients by name or phone number</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
          <CardDescription>{filteredPatients.length} patients found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Date of Birth</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Gender</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr key={patient.id} className="border-b border-border hover:bg-card/50 transition-colors">
                    <td className="py-3 px-4 text-foreground">{patient.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{patient.phone}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground capitalize">{patient.gender || '-'}</td>
                    <td className="py-3 px-4 text-right flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(patient)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePatient(patient.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPatients.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No patients found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <PatientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddPatient}
        initialData={editingPatient}
        title={editingPatient ? 'Edit Patient' : 'Add Patient'}
      />
    </div>
  );
}
