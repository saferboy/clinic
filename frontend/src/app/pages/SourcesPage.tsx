import { useState, useEffect, useMemo } from 'react';
import { Share2, Plus, Edit, Trash2, CheckCircle, XCircle, Search } from 'lucide-react';
import { BaseModal } from '../components/ui/BaseModal';
import { PaginationBar } from '../components/ui/PaginationBar';
import { sourcesApi, Source } from '../api/sources.service';
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

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';
const LIMIT = 7;

function SourceModal({ source, onClose, onSave }: {
  source: Partial<Source> | null;
  onClose: () => void;
  onSave: (dto: { name: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => void;
}) {
  const [form, setForm] = useState({
    name: source?.name || '',
    description: source?.description || '',
    status: (source?.status || 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
  });

  return (
    <BaseModal
      title={source?.id ? 'Manbani tahrirlash' : 'Yangi manba'}
      onClose={onClose}
      size="md"
      onSave={() => onSave({ ...form, description: form.description || undefined })}
    >
      <div>
        <label className="text-sm font-medium mb-1 block">Manba nomi *</label>
        <input
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Masalan: Instagram"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Tavsif</label>
        <textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Manba haqida qisqacha ma'lumot"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Holat</label>
        <select
          value={form.status}
          onChange={e => setForm({ ...form, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ACTIVE">Faol</option>
          <option value="INACTIVE">Nofaol</option>
        </select>
      </div>
    </BaseModal>
  );
}

export function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSource, setEditSource] = useState<Partial<Source> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const response = await sourcesApi.findMany();
      setSources(response.data);
    } catch {
      toast.error("Manbalarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const filtered = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    return sources.filter(s => {
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (q && !s.name.toLowerCase().includes(q) && !(s.description?.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [sources, searchInput, statusFilter]);

  const totalPages = Math.ceil(filtered.length / LIMIT) || 1;
  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  // Filter o'zgarganda 1-sahifaga qaytish
  const handleSearchChange = (v: string) => { setSearchInput(v); setPage(1); };
  const handleStatusChange = (s: StatusFilter) => { setStatusFilter(s); setPage(1); };

  const handleSave = async (form: { name: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => {
    try {
      if (editSource?.id) {
        await sourcesApi.update(editSource.id, form);
        toast.success('Manba muvaffaqiyatli yangilandi');
      } else {
        await sourcesApi.create(form);
        toast.success('Yangi manba muvaffaqiyatli yaratildi');
      }
      setShowModal(false);
      setEditSource(null);
      fetchSources();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      const message = err?.data?.message || err?.message || "Manbani saqlashda xatolik yuz berdi";
      if (message.includes('allaqachon') || message.includes('unique')) {
        toast.error("Bu nomli manba allaqachon mavjud", { duration: 5000 });
      } else {
        toast.error(message, { duration: 5000 });
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await sourcesApi.remove(id);
      toast.success("Manba muvaffaqiyatli o'chirildi");
      setDeleteId(null);
      fetchSources();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      toast.error(err?.data?.message || err?.message || "Manbani o'chirishda xatolik yuz berdi", { duration: 5000 });
    }
  };

  const activeCount = sources.filter(s => s.status === 'ACTIVE').length;
  const inactiveCount = sources.filter(s => s.status === 'INACTIVE').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-xl text-foreground">
          Manbalar ({sources.length} ta)
        </h3>
        <button
          onClick={() => { setEditSource(null); setShowModal(true); }}
          className="px-5 py-3 rounded-xl bg-blue-600 text-white text-base hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={18} />
          Yangi manba
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={searchInput}
          onChange={e => handleSearchChange(e.target.value)}
          placeholder="Manbalarni qidirish..."
          className="w-full pl-10 pr-5 py-3 rounded-xl border border-border bg-background text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => handleStatusChange('ALL')}
          className={`px-5 py-2.5 rounded-xl text-base font-medium transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-800 border border-border text-foreground hover:bg-muted'
          }`}
        >
          Barchasi ({sources.length})
        </button>
        <button
          onClick={() => handleStatusChange('ACTIVE')}
          className={`px-5 py-2.5 rounded-xl text-base font-medium transition-colors flex items-center gap-2 ${
            statusFilter === 'ACTIVE'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-slate-800 border border-border text-foreground hover:bg-muted'
          }`}
        >
          <CheckCircle size={16} />
          Faol ({activeCount})
        </button>
        <button
          onClick={() => handleStatusChange('INACTIVE')}
          className={`px-5 py-2.5 rounded-xl text-base font-medium transition-colors flex items-center gap-2 ${
            statusFilter === 'INACTIVE'
              ? 'bg-gray-600 text-white'
              : 'bg-white dark:bg-slate-800 border border-border text-foreground hover:bg-muted'
          }`}
        >
          <XCircle size={16} />
          Nofaol ({inactiveCount})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">#</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Manba nomi</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Tavsif</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Holat</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.map((src, idx) => (
              <tr key={src.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm text-muted-foreground">{(page - 1) * LIMIT + idx + 1}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <Share2 size={18} className="text-purple-600" />
                    </div>
                    <div className="font-semibold text-base text-foreground">{src.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-base text-muted-foreground max-w-xs truncate">
                  {src.description || <span className="text-muted-foreground/50">—</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                    src.status === 'ACTIVE'
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                  }`}>
                    {src.status === 'ACTIVE' ? 'Faol' : 'Nofaol'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setEditSource(src); setShowModal(true); }}
                      className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteId(src.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Share2 size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-base">
              {searchInput ? `"${searchInput}" bo'yicha manba topilmadi` : 'Manbalar topilmadi'}
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border">
            <div className="text-xs text-muted-foreground">Jami {filtered.length} ta</div>
            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={filtered.length}
              limit={LIMIT}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {showModal && (
        <SourceModal
          source={editSource}
          onClose={() => { setShowModal(false); setEditSource(null); }}
          onSave={handleSave}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Manbani o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Rostdan ham bu manbani o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
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
