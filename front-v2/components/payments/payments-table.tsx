'use client';

import { useState } from 'react';
import { Payment } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit2, Trash2, Download } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PaymentsTableProps {
  payments: Payment[];
  clientNames?: Record<string, string>;
  onEdit: (payment: Payment) => void;
  onDelete: (id: string) => Promise<void>;
  onDownloadInvoice?: (payment: Payment) => void;
  isLoading?: boolean;
}

export function PaymentsTable({
  payments,
  clientNames,
  onEdit,
  onDelete,
  onDownloadInvoice,
  isLoading,
}: PaymentsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await onDelete(deleteId);
      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const statusColors = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    completed: { bg: 'bg-green-100', text: 'text-green-800' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
    refunded: { bg: 'bg-gray-100', text: 'text-gray-800' },
  };

  const methodLabels = {
    cash: 'Cash',
    card: 'Card',
    transfer: 'Transfer',
    insurance: 'Insurance',
  };

  if (payments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">No payments found. Record your first payment.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Method</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => {
              const color = statusColors[payment.status];

              return (
                <TableRow
                  key={payment.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {clientNames?.[payment.clientId] || 'Unknown'}
                  </TableCell>
                  <TableCell className="font-semibold text-green-600">
                    ${payment.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {methodLabels[payment.method as keyof typeof methodLabels]}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`capitalize ${color.bg} ${color.text}`}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payment.createdAt ? formatDate(payment.createdAt) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onDownloadInvoice && (
                          <DropdownMenuItem onClick={() => onDownloadInvoice(payment)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Invoice
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onEdit(payment)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(payment.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Payment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this payment? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
