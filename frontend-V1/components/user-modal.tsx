'use client';

import { useState } from 'react';
import { User, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: Omit<User, 'id' | 'createdAt'>) => void;
  initialData?: User;
  title?: string;
}

const roles: UserRole[] = ['admin', 'doctor', 'staff', 'receptionist'];

export function UserModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title = 'Add User',
}: UserModalProps) {
  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    name: initialData?.name || '',
    role: initialData?.role || 'staff' as UserRole,
    phone: initialData?.phone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      email: formData.email,
      name: formData.name,
      role: formData.role,
      phone: formData.phone || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Manage user account and permissions</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full name"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Role *</label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="555-0000"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save User</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
