import { useState, useEffect } from 'react';
import { UsersRound, Plus, Edit, X, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import { clientGroupsApi, ClientGroup } from '../api/client-groups.service';
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

function ClientGroupModal({ clientGroup, onClose, onSave }: {
  clientGroup: Partial<ClientGroup> | null;
  onClose: () => void;
  onSave: (dto: { name: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => void;
}) {
  const [form, setForm] = useState({
    name: clientGroup?.name || '',
    description: clientGroup?.description || '',
    status: clientGroup?.status || 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">{clientGroup?.id ? "Guruhni tahrirlash" : "Yangi mijoz guruhi"}</h2>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="group-name" className="text-sm font-medium mb-1 block">Guruh nomi *</label>
            <input id="group-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Masalan: VIP mijozlar" />
          </div>
          <div>
            <label htmlFor="group-desc" className="text-sm font-medium mb-1 block">Tavsif</label>
            <textarea id="group-desc" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Guruh haqida qisqacha ma'lumot" />
          </div>
          <div>
            <label htmlFor="group-status" className="text-sm font-medium mb-1 block">Holat</label>
            <select id="group-status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ACTIVE">Faol</option>
              <option value="INACTIVE">Nofaol</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-border">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors">Bekor qilish</button>
          <button type="button" onClick={() => onSave(form)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium">Saqlash</button>
        </div>
      </div>
    </div>
  );
}

export function ClientGroupsPage() {
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editClientGroup, setEditClientGroup] = useState<Partial<ClientGroup> | null>(null);
  const [deleteClientGroupId, setDeleteClientGroupId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 0 });

  const fetchClientGroups = async () => {
    try {
      setLoading(true);
      const response = await clientGroupsApi.findMany({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      const backendData = response.data as any;
      setClientGroups(Array.isArray(backendData?.data) ? backendData.data : []);
      if (backendData?.pagination) {
        setPagination(prev => ({
          ...prev,
          total: backendData.pagination.total || 0,
          totalPages: backendData.pagination.totalPages || 0,
          limit: backendData.pagination.limit || 8,
        }));
      }
    } catch (error) {
      console.error("Mijoz guruhlarini yuklashda xatolik:", error);
      toast.error("Mijoz guruhlarini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPagination(p => ({ ...p, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchClientGroups();
  }, [pagination.page, search, statusFilter]);

  const handleSave = async (form: { name: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => {
    try {
      if (editClientGroup?.id) {
        await clientGroupsApi.update(editClientGroup.id, form);
        toast.success("Guruh muvaffaqiyatli yangilandi");
      } else {
        await clientGroupsApi.create(form);
        toast.success("Yangi guruh muvaffaqiyatli yaratildi");
      }
      setShowModal(false);
      setEditClientGroup(null);
      fetchClientGroups();
    } catch (error: any) {
      console.error("Guruhni saqlashda xatolik:", error);
      let message = "Guruhni saqlashda xatolik yuz berdi";
      if (error?.data?.message) {
        message = error.data.message;
      } else if (error?.message) {
        message = error.message;
      }
      if (error?.data?.errors) {
        const errors = error.data.errors;
        const errorMessages = Object.values(errors).flat().filter((msg: any): msg is string => typeof msg === 'string');
        if (errorMessages.length > 0) {
          toast.error(`Validatsiya xatosi:\n${errorMessages.join('\n')}`, { duration: 6000 });
        } else {
          toast.error(message, { duration: 5000 });
        }
      } else if (message.includes('allaqachon mavjud')) {
        toast.error("Bu nomli guruh allaqachon mavjud", { duration: 5000 });
      } else if (message.includes('Network Error') || message.includes('fetch')) {
        toast.error('Tarmoq xatosi: Serverga ulanib bo\'lmadi', { duration: 5000 });
      } else {
        toast.error(message, { duration: 5000 });
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await clientGroupsApi.remove(id);
      toast.success("Guruh muvaffaqiyatli o'chirildi");
      setDeleteClientGroupId(null);
      fetchClientGroups();
    } catch (error: any) {
      console.error("Guruhni o'chirishda xatolik:", error);
      let message = "Guruhni o'chirishda xatolik yuz berdi";
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
          {statusFilter === 'ALL' ? "Barcha mijoz guruhlari" : statusFilter === 'ACTIVE' ? "Faol guruhlar" : "Nofaol guruhlar"} ({pagination.total} ta)
        </h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchInput}
            onChange={e => { setSearchInput(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            placeholder="Guruhlarni qidirish..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setPagination(p => ({ ...p, page: 1 })); }}
          className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]">
          <option value="ALL">Barcha holat</option>
          <option value="ACTIVE">Faol</option>
          <option value="INACTIVE">Nofaol</option>
        </select>
        <button
          type="button"
          onClick={() => { setEditClientGroup(null); setShowModal(true); }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Yangi guruh</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Guruh nomi</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Tavsif</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Holat</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clientGroups.map(group => (
              <tr key={group.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <UsersRound size={20} className="text-purple-600" />
                    </div>
                    <div className="font-semibold text-base text-foreground">{group.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-base text-muted-foreground max-w-xs truncate">
                  {group.description || '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                    group.status === 'ACTIVE' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                  }`}>
                    {group.status === 'ACTIVE' ? 'Faol' : 'Nofaol'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setEditClientGroup(group); setShowModal(true); }}
                      className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
                      <Edit size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteClientGroupId(group.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clientGroups.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <UsersRound size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-base">Mijoz guruhlari topilmadi</p>
          </div>
        )}
      </div>

      <div className="flex justify-center items-center gap-3 mt-3 mb-3">
        <button
          type="button"
          onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
          disabled={pagination.page === 1}
          className="px-5 py-2.5 rounded-xl border border-border text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
        >
          ← Oldingi
        </button>

        <div className="flex gap-1">
          {Array.from({ length: Math.max(1, pagination.totalPages) }, (_, i) => i + 1).map(page => (
            <button
              type="button"
              key={page}
              onClick={() => setPagination(p => ({ ...p, page }))}
              className={`w-10 h-10 rounded-lg text-base font-medium transition-colors ${
                page === pagination.page ? 'bg-blue-600 text-white' : 'border border-border hover:bg-muted'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
          disabled={pagination.page >= Math.max(1, pagination.totalPages)}
          className="px-5 py-2.5 rounded-xl border border-border text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
        >
          Keyingi →
        </button>
      </div>

      {showModal && (
        <ClientGroupModal
          clientGroup={editClientGroup}
          onClose={() => { setShowModal(false); setEditClientGroup(null); }}
          onSave={handleSave}
        />
      )}

      <AlertDialog open={deleteClientGroupId !== null} onOpenChange={(open) => !open && setDeleteClientGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Guruhni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Rostdan ham bu guruhni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteClientGroupId && handleDelete(deleteClientGroupId)}
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