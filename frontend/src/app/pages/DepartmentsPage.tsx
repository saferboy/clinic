import { useState, useEffect } from 'react';
import { Building2, Plus, Edit, X, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { departmentsApi, Department } from '../api/departments.service';
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

function DepartmentModal({ department, onClose, onSave }: {
  department: Partial<Department> | null;
  onClose: () => void;
  onSave: (dto: { name: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => void;
}) {
  const [form, setForm] = useState({
    name: department?.name || '',
    description: department?.description || '',
    status: department?.status || 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">{department?.id ? "Bo'limni tahrirlash" : "Yangi bo'lim"}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Bo'lim nomi *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Masalan: Kardiologiya" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Tavsif</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Bo'lim haqida qisqacha ma'lumot" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Holat</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ACTIVE">Faol</option>
              <option value="INACTIVE">Nofaol</option>
            </select>
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

export function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Partial<Department> | null>(null);
  const [deleteDepartmentId, setDeleteDepartmentId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 7, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentsApi.findMany({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      // Backend response: { message: "...", data: { data: [...], pagination: {...} } }
      const backendData = response.data as any;
      setDepartments(Array.isArray(backendData?.data) ? backendData.data : []);
      if (backendData?.pagination) {
        setPagination(prev => ({
          ...prev,
          ...backendData.pagination,
        }));
      }
    } catch (error) {
      console.error("Bo'limlarni yuklashda xatolik:", error);
      toast.error("Bo'limlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPagination(p => ({ ...p, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchDepartments();
  }, [pagination.page, search, statusFilter]);

  const handleSave = async (form: { name: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => {
    try {
      if (editDepartment?.id) {
        await departmentsApi.update(editDepartment.id, form);
        toast.success("Bo'lim muvaffaqiyatli yangilandi");
      } else {
        await departmentsApi.create(form);
        toast.success("Yangi bo'lim muvaffaqiyatli yaratildi");
      }
      setShowModal(false);
      setEditDepartment(null);
      fetchDepartments();
    } catch (error: any) {
      console.error("Bo'limni saqlashda xatolik:", error);

      let message = "Bo'limni saqlashda xatolik yuz berdi";

      if (error?.data?.message) {
        message = error.data.message;
      } else if (error?.message) {
        message = error.message;
      }

      if (error?.data?.errors) {
        const errors = error.data.errors;
        const errorMessages = Object.values(errors)
          .flat()
          .filter((msg: any): msg is string => typeof msg === 'string');
        
        if (errorMessages.length > 0) {
          toast.error(`Validatsiya xatosi:\n${errorMessages.join('\n')}`, { duration: 6000 });
        } else {
          toast.error(message, { duration: 5000 });
        }
      } else if (message.includes('DEPT_001') || message.includes('allaqachon')) {
        toast.error("Bu nomli bo'lim allaqachon mavjud", { duration: 5000 });
      } else if (message.includes('Network Error') || message.includes('fetch')) {
        toast.error('Tarmoq xatosi: Serverga ulanib bo\'lmadi', { duration: 5000 });
      } else {
        toast.error(message, { duration: 5000 });
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await departmentsApi.remove(id);
      toast.success("Bo'lim muvaffaqiyatli o'chirildi");
      setDeleteDepartmentId(null);
      fetchDepartments();
    } catch (error: any) {
      console.error("Bo'limni o'chirishda xatolik:", error);
      let message = "Bo'limni o'chirishda xatolik yuz berdi";
      if (error?.data?.message) {
        message = error.data.message;
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
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-xl text-foreground">
          {statusFilter === 'ALL' ? "Barcha bo'limlar" : statusFilter === 'ACTIVE' ? "Faol bo'limlar" : "Nofaol bo'limlar"} ({pagination.total} ta)
        </h3>
        <button
          onClick={() => { setEditDepartment(null); setShowModal(true); }}
          className="px-5 py-3 rounded-xl bg-blue-600 text-white text-base hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium">
          <Plus size={18} />
          Yangi bo'lim
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Bo'limlarni qidirish..."
          className="w-full px-5 py-3 rounded-xl border border-border bg-background text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-5 py-2.5 rounded-xl text-base font-medium transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-800 border border-border text-foreground hover:bg-muted'
          }`}>
          Barchasi
        </button>
        <button
          onClick={() => setStatusFilter('ACTIVE')}
          className={`px-5 py-2.5 rounded-xl text-base font-medium transition-colors flex items-center gap-2 ${
            statusFilter === 'ACTIVE'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-slate-800 border border-border text-foreground hover:bg-muted'
          }`}>
          <CheckCircle size={16} />
          Faol
        </button>
        <button
          onClick={() => setStatusFilter('INACTIVE')}
          className={`px-5 py-2.5 rounded-xl text-base font-medium transition-colors flex items-center gap-2 ${
            statusFilter === 'INACTIVE'
              ? 'bg-gray-600 text-white'
              : 'bg-white dark:bg-slate-800 border border-border text-foreground hover:bg-muted'
          }`}>
          <XCircle size={16} />
          Nofaol
        </button>
      </div>

      {/* Departments List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Bo'lim nomi</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Tavsif</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Holat</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {departments.map(dept => (
              <tr key={dept.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Building2 size={20} className="text-blue-600" />
                    </div>
                    <div className="font-semibold text-base text-foreground">{dept.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-base text-muted-foreground max-w-xs truncate">
                  {dept.description || '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                    dept.status === 'ACTIVE'
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                  }`}>
                    {dept.status === 'ACTIVE' ? 'Faol' : 'Nofaol'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setEditDepartment(dept); setShowModal(true); }}
                      className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteDepartmentId(dept.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {departments.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <Building2 size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-base">Bo'limlar topilmadi</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-3 mb-3">
          <button
            onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-5 py-2.5 rounded-xl border border-border text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            ← Oldingi
          </button>

          <div className="flex gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPagination(p => ({ ...p, page }))}
                className={`w-10 h-10 rounded-lg text-base font-medium transition-colors ${
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
            className="px-5 py-2.5 rounded-xl border border-border text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            Keyingi →
          </button>
        </div>
      )}

      {showModal && (
        <DepartmentModal
          department={editDepartment}
          onClose={() => { setShowModal(false); setEditDepartment(null); }}
          onSave={handleSave}
        />
      )}

      <AlertDialog open={deleteDepartmentId !== null} onOpenChange={(open) => !open && setDeleteDepartmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bo'limni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Rostdan ham bu bo'limni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDepartmentId && handleDelete(deleteDepartmentId)}
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
