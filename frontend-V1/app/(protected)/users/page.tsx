'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/lib/types';
import { UserModal } from '@/components/user-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Search, Edit, Trash2, AlertCircle } from 'lucide-react';

const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@clinic.com',
    name: 'Admin User',
    role: 'admin',
    phone: '555-0001',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'doctor@clinic.com',
    name: 'Dr. Johnson',
    role: 'doctor',
    phone: '555-0002',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'staff@clinic.com',
    name: 'Staff Member',
    role: 'staff',
    phone: '555-0003',
    createdAt: new Date().toISOString(),
  },
];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();
  const [usersList, setUsersList] = useState<User[]>(mockUsers);

  // Check if user has admin role
  if (currentUser?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Users</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don&apos;t have permission to access this page. Only administrators can manage users.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleAddUser = (data: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setUsersList([...usersList, newUser]);
    setEditingUser(undefined);
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) {
      alert("You can't delete your own account");
      return;
    }
    setUsersList(usersList.filter(u => u.id !== id));
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(undefined);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      admin: 'bg-red-500/20 text-red-400',
      doctor: 'bg-blue-500/20 text-blue-400',
      staff: 'bg-purple-500/20 text-purple-400',
      receptionist: 'bg-green-500/20 text-green-400',
    };
    return colors[role];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage system users and permissions</p>
        </div>
        <Button 
          onClick={() => {
            setEditingUser(undefined);
            setIsModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search and Filter</CardTitle>
          <CardDescription>Find users by name, email, or phone</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="receptionist">Receptionist</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>{filteredUsers.length} users found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className="border-b border-border hover:bg-card/50 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">
                      {u.name} {u.id === currentUser?.id && <span className="text-xs text-muted-foreground ml-2">(You)</span>}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                    <td className="py-3 px-4 text-muted-foreground">{u.phone || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${getRoleBadgeColor(u.role)}`}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(u)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={u.id === currentUser?.id}
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        <Trash2 className={`w-4 h-4 ${u.id === currentUser?.id ? 'opacity-50' : 'text-destructive'}`} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Total Users: <span className="text-foreground font-medium">{usersList.length}</span></p>
          <p>Total Admins: <span className="text-foreground font-medium">{usersList.filter(u => u.role === 'admin').length}</span></p>
          <p>Total Doctors: <span className="text-foreground font-medium">{usersList.filter(u => u.role === 'doctor').length}</span></p>
        </CardContent>
      </Card>

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddUser}
        initialData={editingUser}
        title={editingUser ? 'Edit User' : 'Add User'}
      />
    </div>
  );
}
