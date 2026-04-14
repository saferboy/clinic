import { useState, useEffect } from 'react';
import { BedDouble, CheckCircle, AlertCircle, Wrench, Plus, Edit, X, Trash2 } from 'lucide-react';
import { roomsApi, CreateRoomDto, RoomStats } from '../api/rooms.service';
import { departmentsApi, Department } from '../api/departments.service';
import type { Room } from '../types';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

function RoomModal({ room, onClose, onSave, departments }: {
  room: Partial<Room> | null;
  onClose: () => void;
  onSave: (r: CreateRoomDto) => void;
  departments: Department[];
}) {
  const [form, setForm] = useState<CreateRoomDto>(room ? {
    name: room.name || '',
    room_number: room.room_number || '',
    department_id: room.department_id || undefined,
    status: room.status || 'AVAILABLE',
    description: room.description || '',
    record_status: room.record_status || 'ACTIVE',
  } : {
    name: '',
    room_number: '',
    status: 'AVAILABLE',
    description: '',
    record_status: 'ACTIVE',
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">{room?.id ? 'Xonani tahrirlash' : 'Yangi xona'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Xona nomi</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Terapiya Kabineti 1" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Xona raqami</label>
              <input value={form.room_number || ''} onChange={e => setForm({ ...form, room_number: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="101" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Bo'lim</label>
            <select value={form.department_id || ''} onChange={e => setForm({ ...form, department_id: Number(e.target.value) || undefined })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Bo'limni tanlang</option>
              {(departments || []).map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Holat</label>
            <select value={form.status || 'AVAILABLE'} onChange={e => setForm({ ...form, status: e.target.value as Room['status'] })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="AVAILABLE">Bo'sh</option>
              <option value="OCCUPIED">Band</option>
              <option value="MAINTENANCE">Ta'mirda</option>
              <option value="CLOSED">Yopiq</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Tavsif</label>
            <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="2 ta karavot, kompyuter" />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors">Bekor qilish</button>
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium">Saqlash</button>
        </div>
      </div>
    </div>
  );
}

const statusIcons: Record<string, React.ReactNode> = {
  AVAILABLE: <CheckCircle size={18} className="text-green-600" />,
  OCCUPIED: <AlertCircle size={18} className="text-amber-600" />,
  MAINTENANCE: <Wrench size={18} className="text-red-600" />,
  CLOSED: <X size={18} className="text-gray-600" />,
};

const statusColors: Record<string, string> = {
  AVAILABLE: 'border-green-200 dark:border-green-800',
  OCCUPIED: 'border-amber-200 dark:border-amber-800',
  MAINTENANCE: 'border-red-200 dark:border-red-800',
  CLOSED: 'border-gray-200 dark:border-gray-800',
};

const statusTextColors: Record<string, string> = {
  AVAILABLE: 'text-green-600',
  OCCUPIED: 'text-amber-600',
  MAINTENANCE: 'text-red-600',
  CLOSED: 'text-gray-600',
};

const statusBgColors: Record<string, string> = {
  AVAILABLE: 'bg-green-50 dark:bg-green-900/30',
  OCCUPIED: 'bg-amber-50 dark:bg-amber-900/30',
  MAINTENANCE: 'bg-red-50 dark:bg-red-900/30',
  CLOSED: 'bg-gray-50 dark:bg-gray-900/30',
};

const statusLabels: Record<string, string> = {
  AVAILABLE: 'Bo\'sh',
  OCCUPIED: 'Band',
  MAINTENANCE: 'Ta\'mirda',
  CLOSED: 'Yopiq',
};

export function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState<Partial<Room> | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState<Room['status'] | 'ALL'>('ALL');
  const [deleteRoomId, setDeleteRoomId] = useState<number | null>(null);
  const [stats, setStats] = useState<RoomStats>({ total: 0, available: 0, occupied: 0, maintenance: 0, closed: 0 });
  const [departments, setDepartments] = useState<Department[]>([]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const params: any = { page: pagination.page, limit: pagination.limit };
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      const response = await roomsApi.findMany(params);
      setRooms(response.data);
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination,
        }));
      }
    } catch (error) {
      console.error('Xonalarni yuklashda xatolik:', error);
      toast.error('Xonalarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await roomsApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Statistikani yuklashda xatolik:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentsApi.findAll();
      // Backend response: { data: { data: Department[], pagination: {...} } }
      const departmentsData = response.data as any;
      setDepartments(Array.isArray(departmentsData?.data) ? departmentsData.data : []);
    } catch (error) {
      console.error('Bo\'limlarni yuklashda xatolik:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchStats();
    fetchDepartments();
  }, [pagination.page, pagination.limit, statusFilter]);

  const handleSave = async (form: CreateRoomDto) => {
    try {
      if (editRoom?.id) {
        await roomsApi.update(editRoom.id, form);
        toast.success('Xona muvaffaqiyatli yangilandi');
      } else {
        await roomsApi.create(form);
        toast.success('Yangi xona muvaffaqiyatli yaratildi');
      }
      setShowModal(false);
      setEditRoom(null);
      fetchRooms();
      fetchStats();
    } catch (error: any) {
      console.error('Xonani saqlashda xatolik:', error);

      // Extract error message
      let message = 'Xonani saqlashda xatolik yuz berdi';

      // Our custom API client structure: error.data or error.message
      if (error?.data?.message) {
        message = error.data.message;
      } else if (error?.data?.errors) {
        // Validation errors
      } else if (error?.message) {
        message = error.message;
      }

      // Show error toast with network error handling
      if (message.includes('Network Error') || message.includes('fetch')) {
        toast.error('Tarmoq xatosi: Serverga ulanib bo\'lmadi', {
          duration: 5000,
        });
      } else if (message.includes('Bu xona raqami allaqachon mavjud')) {
        toast.error('Xatolik: Bu xona raqami allaqachon mavjud. Iltimos, boshqa xona raqamini kiriting', {
          duration: 5000,
        });
      } else if (message.includes('Bu xona nomi allaqachon mavjud')) {
        toast.error('Xatolik: Bu xona nomi allaqachon mavjud', {
          duration: 5000,
        });
      } else {
        // Handle validation errors with field-specific messages
        const errors = error?.data?.errors;
        if (errors && typeof errors === 'object') {
          // Collect all validation messages and clean them up
          const errorMessages = Object.values(errors)
            .flat()
            .filter((msg: any): msg is string => typeof msg === 'string');
          
          if (errorMessages.length > 0) {
            // Show each validation error on a new line
            const formattedMessage = errorMessages.join('\n');
            toast.error(`Validatsiya xatosi:\n${formattedMessage}`, {
              duration: 6000,
            });
          } else {
            toast.error(message, { duration: 5000 });
          }
        } else {
          toast.error(message, {
            duration: 5000,
          });
        }
      }
    }
  };

  const changeStatus = async (id: number, status: Room['status']) => {
    try {
      await roomsApi.updateStatus(id, { status });
      toast.success('Xona holati muvaffaqiyatli o\'zgartirildi');
      fetchRooms();
    } catch (error: any) {
      console.error('Xona statusini o\'zgartirishda xatolik:', error);
      let message = 'Xona holatini o\'zgartirishda xatolik yuz berdi';
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      }
      toast.error(message, { duration: 5000 });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await roomsApi.remove(id);
      toast.success('Xona muvaffaqiyatli o\'chirildi');
      setDeleteRoomId(null);
      fetchRooms();
      fetchStats();
    } catch (error: any) {
      console.error('Xonani o\'chirishda xatolik:', error);
      let message = 'Xonani o\'chirishda xatolik yuz berdi';
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      }
      toast.error(message, { duration: 5000 });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Yuklanmoqda...</div></div>;
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm text-center">
          <div className="text-3xl font-bold text-green-600">{stats.available}</div>
          <div className="text-sm text-muted-foreground mt-1">Bo'sh xonalar</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm text-center">
          <div className="text-3xl font-bold text-amber-600">{stats.occupied}</div>
          <div className="text-sm text-muted-foreground mt-1">Band xonalar</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm text-center">
          <div className="text-3xl font-bold text-red-600">{stats.maintenance}</div>
          <div className="text-sm text-muted-foreground mt-1">Ta'mirda</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm text-center">
          <div className="text-3xl font-bold text-gray-600">{stats.closed}</div>
          <div className="text-sm text-muted-foreground mt-1">Yopiq xonalar</div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-800 border border-border text-foreground hover:bg-muted'
          }`}>
          Barchasi
        </button>
        <button
          onClick={() => setStatusFilter('AVAILABLE')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
            statusFilter === 'AVAILABLE'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-slate-800 border border-border text-foreground hover:bg-muted'
          }`}>
          <CheckCircle size={14} />
          Bo'sh
        </button>
        <button
          onClick={() => setStatusFilter('OCCUPIED')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
            statusFilter === 'OCCUPIED'
              ? 'bg-amber-600 text-white'
              : 'bg-white dark:bg-slate-800 border border-border text-foreground hover:bg-muted'
          }`}>
          <AlertCircle size={14} />
          Band
        </button>
        <button
          onClick={() => setStatusFilter('MAINTENANCE')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
            statusFilter === 'MAINTENANCE'
              ? 'bg-red-600 text-white'
              : 'bg-white dark:bg-slate-800 border border-border text-foreground hover:bg-muted'
          }`}>
          <Wrench size={14} />
          Ta'mirda
        </button>
        <button
          onClick={() => setStatusFilter('CLOSED')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
            statusFilter === 'CLOSED'
              ? 'bg-gray-600 text-white'
              : 'bg-white dark:bg-slate-800 border border-border text-foreground hover:bg-muted'
          }`}>
          <X size={14} />
          Yopiq
        </button>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">
          {statusFilter === 'ALL' ? 'Barcha xonalar' : statusLabels[statusFilter]} ({rooms.length} ta)
        </h3>
        <button
          onClick={() => { setEditRoom(null); setShowModal(true); }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium">
          <Plus size={16} />
          Yangi xona
        </button>
      </div>

      {/* Room Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map(room => (
          <div key={room.id} className={`bg-white dark:bg-slate-800 rounded-2xl border-2 shadow-sm overflow-hidden transition-all hover:shadow-md ${statusColors[room.status] || 'border-gray-200 dark:border-gray-800'}`}>
            <div className="p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${statusBgColors[room.status] || 'bg-gray-50 dark:bg-gray-900/30'}`}>
                    <BedDouble size={18} className={statusTextColors[room.status] || 'text-gray-600'} />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-base">{room.name}</div>
                    {room.room_number && <div className="text-sm text-muted-foreground">№{room.room_number}</div>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditRoom(room); setShowModal(true); }}
                    className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteRoomId(room.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                    <X size={15} />
                  </button>
                </div>
              </div>

              {room.department && (
                <div className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Bo'lim:</span> {room.department.name}
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  {statusIcons[room.status]}
                  <span className={`text-sm font-medium ${statusTextColors[room.status] || 'text-gray-600'}`}>{statusLabels[room.status]}</span>
                </div>
              </div>

              {room.description && (
                <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {room.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-1 mb-4">
          <button
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 rounded-xl border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            ← Oldingi
          </button>

          <div className="flex gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPagination(p => ({ ...p, page }))}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  page === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'border border-border hover:bg-muted'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            disabled={pagination.page >= pagination.totalPages}
            className="px-4 py-2 rounded-xl border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            Keyingi →
          </button>
        </div>
      )}

      {showModal && (
        <RoomModal
          room={editRoom}
          onClose={() => { setShowModal(false); setEditRoom(null); }}
          onSave={handleSave}
          departments={departments}
        />
      )}

      <AlertDialog open={deleteRoomId !== null} onOpenChange={(open) => !open && setDeleteRoomId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xonani o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Rostdan ham bu xonani o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRoomId && handleDelete(deleteRoomId)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 size={16} className="mr-2" />
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
