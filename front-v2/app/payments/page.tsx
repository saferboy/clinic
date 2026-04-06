'use client';

import { useState, useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PaymentForm } from '@/components/payments/payment-form';
import { PaymentsTable } from '@/components/payments/payments-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Payment } from '@/lib/types';
import { Plus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock payments data
const mockPayments: Payment[] = [
  {
    id: '1',
    visitId: '1',
    clientId: '1',
    amount: 150,
    method: 'cash',
    status: 'completed',
    invoiceNumber: 'INV-001',
    notes: 'Consultation payment',
    paidAt: new Date('2024-04-05'),
    createdAt: new Date('2024-04-05'),
    updatedAt: new Date('2024-04-05'),
  },
  {
    id: '2',
    visitId: '2',
    clientId: '2',
    amount: 75,
    method: 'card',
    status: 'completed',
    invoiceNumber: 'INV-002',
    notes: 'Vaccination payment',
    paidAt: new Date('2024-04-06'),
    createdAt: new Date('2024-04-06'),
    updatedAt: new Date('2024-04-06'),
  },
  {
    id: '3',
    visitId: '3',
    clientId: '3',
    amount: 200,
    method: 'transfer',
    status: 'pending',
    invoiceNumber: 'INV-003',
    notes: 'Lab test payment',
    createdAt: new Date('2024-04-07'),
    updatedAt: new Date('2024-04-07'),
  },
];

// Mock visits data
const mockVisits = [
  { id: '1', clientId: '1', serviceId: '1' },
  { id: '2', clientId: '2', serviceId: '2' },
  { id: '3', clientId: '3', serviceId: '3' },
];

// Mock clients data
const mockClients = [
  { id: '1', firstName: 'Ahmed', lastName: 'Khan' },
  { id: '2', firstName: 'Fatima', lastName: 'Ali' },
  { id: '3', firstName: 'Hassan', lastName: 'Omar' },
];

type PaymentFormValues = {
  visitId: string;
  clientId: string;
  amount: string;
  method: 'cash' | 'card' | 'transfer' | 'insurance';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  invoiceNumber?: string;
  notes?: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate summary stats
  const stats = useMemo(() => {
    const completed = payments.filter((p) => p.status === 'completed');
    const totalRevenue = completed.reduce((sum, p) => sum + p.amount, 0);
    const pending = payments.filter((p) => p.status === 'pending');
    const pendingAmount = pending.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalRevenue,
      pendingAmount,
      totalPayments: payments.length,
      completedPayments: completed.length,
    };
  }, [payments]);

  // Filter payments based on search term
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const searchLower = searchTerm.toLowerCase();
      const clientName = mockClients
        .find((c) => c.id === payment.clientId)
        ?.firstName.toLowerCase() || '';
      return (
        clientName.includes(searchLower) ||
        payment.invoiceNumber?.toLowerCase().includes(searchLower)
      );
    });
  }, [payments, searchTerm]);

  const clientNames = useMemo(() => {
    const mapping: Record<string, string> = {};
    mockClients.forEach((client) => {
      mapping[client.id] = `${client.firstName} ${client.lastName}`;
    });
    return mapping;
  }, []);

  const handleAddPayment = async (formData: PaymentFormValues) => {
    try {
      setIsLoading(true);

      const newPayment: Payment = {
        id: `${Date.now()}`,
        visitId: formData.visitId,
        clientId: formData.clientId,
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: formData.status,
        invoiceNumber: formData.invoiceNumber,
        notes: formData.notes,
        paidAt: formData.status === 'completed' ? new Date() : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setPayments([...payments, newPayment]);
      setIsFormOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPayment = async (formData: PaymentFormValues) => {
    try {
      setIsLoading(true);

      if (!editingPayment) return;

      const updatedPayment: Payment = {
        ...editingPayment,
        visitId: formData.visitId,
        clientId: formData.clientId,
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: formData.status,
        invoiceNumber: formData.invoiceNumber,
        notes: formData.notes,
        paidAt:
          formData.status === 'completed' && !editingPayment.paidAt
            ? new Date()
            : editingPayment.paidAt,
        updatedAt: new Date(),
      };

      setPayments(
        payments.map((p) => (p.id === editingPayment.id ? updatedPayment : p))
      );
      setEditingPayment(null);
      setIsFormOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      setIsLoading(true);
      setPayments(payments.filter((p) => p.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = (payment: Payment) => {
    // Simulate invoice download
    console.log('Downloading invoice for payment:', payment.id);
    alert(`Invoice ${payment.invoiceNumber} downloaded!`);
  };

  const handleEditClick = (payment: Payment) => {
    setEditingPayment(payment);
    setIsFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      setEditingPayment(null);
    }
    setIsFormOpen(open);
  };

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-2">Manage payments and invoices</p>
          </div>

          <Dialog open={isFormOpen} onOpenChange={handleFormOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPayment ? 'Edit Payment' : 'Record New Payment'}
                </DialogTitle>
                <DialogDescription>
                  {editingPayment
                    ? 'Update the payment details below'
                    : 'Record a new payment for a visit'}
                </DialogDescription>
              </DialogHeader>
              <PaymentForm
                initialData={editingPayment || undefined}
                visits={mockVisits}
                onSubmit={editingPayment ? handleEditPayment : handleAddPayment}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ${stats.totalRevenue.toFixed(2)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Pending Amount</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              ${stats.pendingAmount.toFixed(2)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Completed Payments</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats.completedPayments}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-gray-600">Total Transactions</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {stats.totalPayments}
            </p>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by client name or invoice number..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Payments Table */}
        <PaymentsTable
          payments={filteredPayments}
          clientNames={clientNames}
          onEdit={handleEditClick}
          onDelete={handleDeletePayment}
          onDownloadInvoice={handleDownloadInvoice}
          isLoading={isLoading}
        />
      </div>
    </ProtectedRoute>
  );
}
