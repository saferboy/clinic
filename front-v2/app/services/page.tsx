'use client';

import { useState, useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Service } from '@/lib/types';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import { Plus, Search, Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

const serviceSchema = z.object({
  name: z.string().min(2, 'Service name is required'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  duration: z.string().min(1, 'Duration is required'),
  category: z.string().min(1, 'Category is required'),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

// Mock services data
const mockServices: Service[] = [
  {
    id: '1',
    name: 'Consultation',
    description: 'General medical consultation',
    price: 100,
    duration: 30,
    category: 'Consultation',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Vaccination',
    description: 'Standard vaccinations',
    price: 50,
    duration: 15,
    category: 'Vaccination',
    status: 'active',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '3',
    name: 'Blood Test',
    description: 'Complete blood work analysis',
    price: 75,
    duration: 45,
    category: 'Laboratory',
    status: 'active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: editingService
      ? {
          name: editingService.name,
          description: editingService.description,
          price: editingService.price.toString(),
          duration: editingService.duration.toString(),
          category: editingService.category,
        }
      : {
          name: '',
          description: '',
          price: '',
          duration: '30',
          category: '',
        },
  });

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        service.name.toLowerCase().includes(searchLower) ||
        service.category.toLowerCase().includes(searchLower) ||
        service.description?.toLowerCase().includes(searchLower)
      );
    });
  }, [services, searchTerm]);

  const handleAddService = async (values: ServiceFormValues) => {
    try {
      setIsLoading(true);

      const newService: Service = {
        id: `${Date.now()}`,
        name: values.name,
        description: values.description,
        price: parseFloat(values.price),
        duration: parseInt(values.duration),
        category: values.category,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setServices([...services, newService]);
      form.reset();
      setIsFormOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditService = async (values: ServiceFormValues) => {
    try {
      setIsLoading(true);

      if (!editingService) return;

      const updatedService: Service = {
        ...editingService,
        name: values.name,
        description: values.description,
        price: parseFloat(values.price),
        duration: parseInt(values.duration),
        category: values.category,
        updatedAt: new Date(),
      };

      setServices(
        services.map((s) => (s.id === editingService.id ? updatedService : s))
      );
      setEditingService(null);
      form.reset();
      setIsFormOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      setIsLoading(true);
      setServices(services.filter((s) => s.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (service: Service) => {
    setEditingService(service);
    form.reset({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
    });
    setIsFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      setEditingService(null);
      form.reset();
    }
    setIsFormOpen(open);
  };

  const onSubmit = editingService ? handleEditService : handleAddService;

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services</h1>
            <p className="text-gray-600 mt-2">Manage medical services and pricing</p>
          </div>

          <Dialog open={isFormOpen} onOpenChange={handleFormOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </DialogTitle>
                <DialogDescription>
                  {editingService
                    ? 'Update the service details'
                    : 'Create a new medical service'}
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
                        <FormLabel>Service Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Consultation" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Service description"
                            {...field}
                            disabled={isLoading}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
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
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (min)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="15"
                              step="15"
                              placeholder="30"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
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
                            {SERVICE_CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading
                      ? 'Saving...'
                      : editingService
                      ? 'Update Service'
                      : 'Add Service'}
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
              placeholder="Search by name or category..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Services Table */}
        {filteredServices.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">No services found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="font-semibold">Duration</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow
                    key={service.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="text-gray-600">{service.category}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      ${service.price.toFixed(2)}
                    </TableCell>
                    <TableCell>{service.duration} min</TableCell>
                    <TableCell>
                      <Badge
                        variant={service.status === 'active' ? 'default' : 'secondary'}
                        className={
                          service.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(service)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteService(service.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
