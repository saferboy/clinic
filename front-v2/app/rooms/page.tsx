'use client';

import { useState, useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Room } from '@/lib/types';
import { ROOM_TYPES } from '@/lib/constants';
import { Plus, Search, Edit2, Trash2, MoreHorizontal, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

const roomSchema = z.object({
  name: z.string().min(2, 'Room name is required'),
  type: z.enum(['consultation', 'treatment', 'surgery', 'waiting']),
  capacity: z.string().min(1, 'Capacity is required'),
  equipment: z.string().optional(),
});

type RoomFormValues = z.infer<typeof roomSchema>;

// Mock rooms data
const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Room A',
    type: 'consultation',
    capacity: 2,
    equipment: ['Blood Pressure Monitor', 'Thermometer'],
    status: 'available',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Room B',
    type: 'treatment',
    capacity: 1,
    equipment: ['X-Ray Machine', 'Ultrasound'],
    status: 'occupied',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '3',
    name: 'Surgery Suite 1',
    type: 'surgery',
    capacity: 4,
    equipment: ['Surgical Table', 'Lights', 'Anesthesia Machine'],
    status: 'available',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    name: 'Waiting Area',
    type: 'waiting',
    capacity: 20,
    status: 'available',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

const statusColors = {
  available: { bg: 'bg-green-100', text: 'text-green-800', label: 'Available' },
  occupied: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Occupied' },
  maintenance: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Maintenance' },
};

const typeLabels = {
  consultation: 'Consultation',
  treatment: 'Treatment',
  surgery: 'Surgery',
  waiting: 'Waiting Area',
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RoomFormValues>({
    resolver: roomSchema,
    defaultValues: editingRoom
      ? {
          name: editingRoom.name,
          type: editingRoom.type,
          capacity: editingRoom.capacity.toString(),
          equipment: editingRoom.equipment?.join(', '),
        }
      : {
          name: '',
          type: 'consultation',
          capacity: '',
          equipment: '',
        },
  });

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        room.name.toLowerCase().includes(searchLower) ||
        typeLabels[room.type].toLowerCase().includes(searchLower)
      );
    });
  }, [rooms, searchTerm]);

  const handleAddRoom = async (values: RoomFormValues) => {
    try {
      setIsLoading(true);

      const newRoom: Room = {
        id: `${Date.now()}`,
        name: values.name,
        type: values.type,
        capacity: parseInt(values.capacity),
        equipment: values.equipment ? values.equipment.split(',').map((e) => e.trim()) : undefined,
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setRooms([...rooms, newRoom]);
      form.reset();
      setIsFormOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRoom = async (values: RoomFormValues) => {
    try {
      setIsLoading(true);

      if (!editingRoom) return;

      const updatedRoom: Room = {
        ...editingRoom,
        name: values.name,
        type: values.type,
        capacity: parseInt(values.capacity),
        equipment: values.equipment ? values.equipment.split(',').map((e) => e.trim()) : undefined,
        updatedAt: new Date(),
      };

      setRooms(rooms.map((r) => (r.id === editingRoom.id ? updatedRoom : r)));
      setEditingRoom(null);
      form.reset();
      setIsFormOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      setIsLoading(true);
      setRooms(rooms.filter((r) => r.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (room: Room) => {
    setEditingRoom(room);
    form.reset({
      name: room.name,
      type: room.type,
      capacity: room.capacity.toString(),
      equipment: room.equipment?.join(', '),
    });
    setIsFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      setEditingRoom(null);
      form.reset();
    }
    setIsFormOpen(open);
  };

  const onSubmit = editingRoom ? handleEditRoom : handleAddRoom;

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
            <p className="text-gray-600 mt-2">Manage clinic rooms and facilities</p>
          </div>

          <Dialog open={isFormOpen} onOpenChange={handleFormOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </DialogTitle>
                <DialogDescription>
                  {editingRoom ? 'Update the room details' : 'Create a new room'}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Room A, Surgery Suite 1" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Type</FormLabel>
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
                            {ROOM_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
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
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
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
                    name="equipment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Equipment (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List equipment separated by commas&#10;e.g., Blood Pressure Monitor, Thermometer, X-Ray Machine"
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
                    {isLoading ? 'Saving...' : editingRoom ? 'Update Room' : 'Add Room'}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by room name or type..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Rooms Grid */}
        {filteredRooms.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No rooms found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => {
              const statusColor = statusColors[room.status];
              const typeLabel = typeLabels[room.type];

              return (
                <Card key={room.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-gray-600" />
                          <CardTitle>{room.name}</CardTitle>
                        </div>
                        <CardDescription className="mt-1">{typeLabel}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(room)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteRoom(room.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge
                        className={`${statusColor.bg} ${statusColor.text}`}
                        variant="secondary"
                      >
                        {statusColor.label}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Capacity</span>
                      <span className="font-medium">{room.capacity} people</span>
                    </div>

                    {room.equipment && room.equipment.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600 block mb-2">Equipment</span>
                        <div className="flex flex-wrap gap-2">
                          {room.equipment.map((item, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
