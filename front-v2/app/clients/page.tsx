'use client';

import { useState, useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { ClientForm } from '@/components/clients/client-form';
import { ClientsTable } from '@/components/clients/clients-table';
import { ClientDetails } from '@/components/clients/client-details';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Client } from '@/lib/types';
import { Plus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock clients data
const mockClients: Client[] = [
  {
    id: '1',
    firstName: 'Ahmed',
    lastName: 'Khan',
    dateOfBirth: new Date('1985-03-15'),
    gender: 'male',
    phone: '+1234567890',
    email: 'ahmed@email.com',
    address: '123 Main St, City',
    insuranceNumber: 'INS-001',
    bloodType: 'O+',
    medicalHistory: 'Hypertension, Diabetes Type 2',
    emergencyContact: 'Fatima Khan',
    emergencyContactPhone: '+1234567891',
    status: 'active',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    firstName: 'Fatima',
    lastName: 'Ali',
    dateOfBirth: new Date('1990-07-20'),
    gender: 'female',
    phone: '+1234567892',
    email: 'fatima@email.com',
    address: '456 Oak Ave, City',
    insuranceNumber: 'INS-002',
    bloodType: 'A+',
    medicalHistory: 'Asthma',
    emergencyContact: 'Ahmed Khan',
    emergencyContactPhone: '+1234567890',
    status: 'active',
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2024-02-20'),
  },
  {
    id: '3',
    firstName: 'Hassan',
    lastName: 'Omar',
    dateOfBirth: new Date('1988-11-10'),
    gender: 'male',
    phone: '+1234567893',
    email: 'hassan@email.com',
    address: '789 Pine Rd, City',
    insuranceNumber: 'INS-003',
    bloodType: 'B+',
    medicalHistory: 'High cholesterol',
    emergencyContact: 'Aisha Omar',
    emergencyContactPhone: '+1234567894',
    status: 'inactive',
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2024-03-10'),
  },
];

type ClientFormValues = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address?: string;
  insuranceNumber?: string;
  bloodType?: string;
  medicalHistory?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        client.phone.includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower)
      );
    });
  }, [clients, searchTerm]);

  const handleAddClient = async (formData: ClientFormValues) => {
    try {
      setIsLoading(true);

      // Simulate API call
      const newClient: Client = {
        id: `${Date.now()}`,
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setClients([...clients, newClient]);
      setIsFormOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClient = async (formData: ClientFormValues) => {
    try {
      setIsLoading(true);

      if (!editingClient) return;

      const updatedClient: Client = {
        ...editingClient,
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth),
        updatedAt: new Date(),
      };

      setClients(
        clients.map((c) => (c.id === editingClient.id ? updatedClient : c))
      );
      setEditingClient(null);
      setIsFormOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      setIsLoading(true);
      // Simulate API call
      setClients(clients.filter((c) => c.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleViewClick = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      setEditingClient(null);
    }
    setIsFormOpen(open);
  };

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-2">Manage your clinic clients and patients</p>
          </div>

          <Dialog open={isFormOpen} onOpenChange={handleFormOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingClient ? 'Edit Client' : 'Add New Client'}
                </DialogTitle>
                <DialogDescription>
                  {editingClient
                    ? 'Update the client information below'
                    : 'Fill in the form below to add a new client'}
                </DialogDescription>
              </DialogHeader>
              <ClientForm
                initialData={editingClient || undefined}
                onSubmit={editingClient ? handleEditClient : handleAddClient}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, phone, or email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Clients Table */}
        <ClientsTable
          clients={filteredClients}
          onEdit={handleEditClick}
          onDelete={handleDeleteClient}
          onView={handleViewClick}
          isLoading={isLoading}
        />

        {/* Client Details Dialog */}
        <ClientDetails
          client={selectedClient}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      </div>
    </ProtectedRoute>
  );
}
