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
import { Payment } from '@/lib/types';
import { PAYMENT_METHODS } from '@/lib/constants';
import { useState } from 'react';

const paymentSchema = z.object({
  visitId: z.string().min(1, 'Visit is required'),
  clientId: z.string().min(1, 'Client is required'),
  amount: z.string().min(1, 'Amount is required'),
  method: z.enum(['cash', 'card', 'transfer', 'insurance']),
  status: z.enum(['pending', 'completed', 'cancelled', 'refunded']),
  invoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  initialData?: Payment;
  visits: Array<{ id: string; clientId: string; serviceId: string }>;
  onSubmit: (data: PaymentFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function PaymentForm({
  initialData,
  visits,
  onSubmit,
  isLoading,
}: PaymentFormProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: initialData
      ? {
          visitId: initialData.visitId,
          clientId: initialData.clientId,
          amount: initialData.amount.toString(),
          method: initialData.method,
          status: initialData.status,
          invoiceNumber: initialData.invoiceNumber || '',
          notes: initialData.notes || '',
        }
      : {
          visitId: '',
          clientId: '',
          amount: '',
          method: 'cash',
          status: 'pending',
          invoiceNumber: '',
          notes: '',
        },
  });

  async function handleSubmit(values: PaymentFormValues) {
    try {
      setError(null);
      await onSubmit(values);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save payment';
      setError(errorMessage);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Payment' : 'Record New Payment'}</CardTitle>
        <CardDescription>
          {initialData ? 'Update payment information' : 'Record a payment for a visit'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
            )}

            {/* Payment Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="visitId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visit</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          const selectedVisit = visits.find((v) => v.id === value);
                          if (selectedVisit) {
                            form.setValue('clientId', selectedVisit.clientId);
                          }
                        }}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {visits.map((visit) => (
                            <SelectItem key={visit.id} value={visit.id}>
                              Visit #{visit.id.slice(-4)}
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
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
                          {PAYMENT_METHODS.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
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
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Invoice Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Information</h3>
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="INV-001"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Payment notes or reference..."
                      {...field}
                      disabled={isLoading}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Saving...' : 'Save Payment'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
