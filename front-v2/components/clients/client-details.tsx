'use client';

import { Client } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClientDetailsProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientDetails({ client, open, onOpenChange }: ClientDetailsProps) {
  if (!client) return null;

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client.firstName} {client.lastName}</DialogTitle>
          <DialogDescription>
            <Badge
              variant={client.status === 'active' ? 'default' : 'secondary'}
              className={
                client.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }
            >
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="text-base font-medium">{calculateAge(client.dateOfBirth)} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="text-base font-medium">{formatDate(client.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="text-base font-medium capitalize">{client.gender}</p>
              </div>
              {client.bloodType && (
                <div>
                  <p className="text-sm text-gray-600">Blood Type</p>
                  <p className="text-base font-medium">{client.bloodType}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-base font-medium">{client.phone}</p>
              </div>
              {client.email && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-base font-medium">{client.email}</p>
                </div>
              )}
              {client.address && (
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="text-base font-medium">{client.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.insuranceNumber && (
                <div>
                  <p className="text-sm text-gray-600">Insurance Number</p>
                  <p className="text-base font-medium">{client.insuranceNumber}</p>
                </div>
              )}
              {client.medicalHistory && (
                <div>
                  <p className="text-sm text-gray-600">Medical History</p>
                  <p className="text-base font-medium whitespace-pre-wrap">{client.medicalHistory}</p>
                </div>
              )}
              {!client.insuranceNumber && !client.medicalHistory && (
                <p className="text-sm text-gray-500">No medical information provided</p>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          {(client.emergencyContact || client.emergencyContactPhone) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.emergencyContact && (
                  <div>
                    <p className="text-sm text-gray-600">Contact Name</p>
                    <p className="text-base font-medium">{client.emergencyContact}</p>
                  </div>
                )}
                {client.emergencyContactPhone && (
                  <div>
                    <p className="text-sm text-gray-600">Contact Phone</p>
                    <p className="text-base font-medium">{client.emergencyContactPhone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
