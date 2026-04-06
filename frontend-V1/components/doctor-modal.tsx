'use client';

import { useState } from 'react';
import { Doctor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Doctor;
  title?: string;
}

export function DoctorModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title = 'Add Doctor',
}: DoctorModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    specialization: initialData?.specialization || '',
    licenseNumber: initialData?.licenseNumber || '',
    availability: (initialData?.availability || []).join(', '),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone,
      specialization: formData.specialization,
      licenseNumber: formData.licenseNumber,
      availability: formData.availability
        ? formData.availability.split(',').map(a => a.trim())
        : undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Enter doctor information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Doctor name"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="doctor@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone *</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="555-0000"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Specialization *</label>
            <Input
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g., Cardiology, Orthopedics"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">License Number *</label>
            <Input
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              placeholder="e.g., MD001234"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Availability</label>
            <Input
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              placeholder="Monday, Wednesday, Friday"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Doctor</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
