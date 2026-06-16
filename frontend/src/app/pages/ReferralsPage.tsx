import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { Award, Plus, Edit, Trash2, CheckCircle, XCircle, Search, Phone } from 'lucide-react';
import { BaseModal } from '../components/ui/BaseModal';
import { PaginationBar } from '../components/ui/PaginationBar';
import { referralsApi, Referral } from '../api/referrals.service';
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

function ReferralModal({ referral, onClose, onSave }: {
  referral: Partial<Referral> | null;
  onClose: () => void;
  onSave: (dto: { full_name: string; phone?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => void;
}) {
  const [form, setForm] = useState({
    full_name: referral?.full_name || '',
    phone: referral?.phone || '',
    description: referral?.description || '',
    status: (referral?.status || 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
  });

  return (
    <BaseModal
      title={referral?.id ? 'Tavsiyachini tahrirlash' : 'Yangi tavsiyachi'}
      onClose={onClose}
      size="md"
      onSave={() => onSave({
        full_name: form.full_name,
        phone: form.phone || undefined,
        description: form.description || undefined,
        status: form.status,
      })}
    >
      <div>
        <label className="text-sm font-medium mb-1 block">F.I.O *</label>
        <input
          value={form.full_name}
          onChange={e => setForm({ ...form, full_name: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ism Familiya"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Telefon</label>
        <input
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="+998901234567"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Tavsif</label>
        <textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Qo'shimcha ma'lumot"
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

export function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editReferral, setEditReferral] = useState<Partial<Referral> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 7, total: 0, totalPages: 0 });
  const abortRef = useRef<AbortController | null>(null);

  const fetchReferrals = async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;
    try {
      setLoading(true);
      const res = await referralsApi.findMany({
        page: pagination.page,
        limit: pagination.limit,
        full_name: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      if (signal.aborted) return;
      setReferrals(res.data);
      setPagination(prev => ({ ...prev, ...res.pagination }));
    } catch {
      if (signal.aborted) return;
      toast.error('Tavsiyachilarni yuklashda xatolik yuz berdi');
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    setPagination(p => ({ ...p, page: 1 }));
  }, [search, statusFilter]);

  useEffect(() => {
    fetchReferrals();
    return () => abortRef.current?.abort();
  }, [pagination.page, search, statusFilter]);

  const handleSave = async (form: { full_name: string; phone?: string; description?: string; status?: 'ACTIVE' | 'INACTIVE' }) => {
    try {
      if (editReferral?.id) {
        await referralsApi.update(editReferral.id, form);
        toast.success('Tavsiyachi muvaffaqiyatli yangilandi');
      } else {
        await referralsApi.create(form);
        toast.success('Yangi tavsiyachi muvaffaqiyatli yaratildi');
      }
      setShowModal(false);
      setEditReferral(null);
      fetchReferrals();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      const msg = err?.data?.message || err?.message || 'Saqlashda xatolik yuz berdi';
      if (msg.includes('allaqachon') || msg.includes('mavjud')) {
        toast.error('Bu telefon raqam allaqachon mavjud', { duration: 5000 });
      } else {
        toast.error(msg, { duration: 5000 });
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await referralsApi.remove(id);
      toast.success("Tavsiyachi muvaffaqiyatli o'chirildi");
      setDeleteId(null);
      fetchReferrals();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      toast.error(err?.data?.message || err?.message || "O'chirishda xatolik yuz berdi", { duration: 5000 });
    }
  };

  if (loading && referrals.length === 0) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Yuklanmoqda...</div></div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-xl text-foreground">
          Tavsiyachilar ({pagination.total} ta)
        </h3>
        <button
          onClick={() => { setEditReferral(null); setShowModal(true); }}
          className="px-5 py-3 rounded-xl bg-blue-600 text-white text-base hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={18} />
          Yangi tavsiyachi
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Ism bo'yicha qidirish..."
          className="w-full pl-10 pr-5 py-3 rounded-xl border border-border bg-background text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-5 py-2.5 rounded-xl text-base font-medium transition-colors flex items-center gap-2 ${
              statusFilter === s
                ? s === 'ALL' ? 'bg-blue-600 text-white'
                  : s === 'ACTIVE' ? 'bg-green-600 text-white'
                  : 'bg-gray-600 text-white'
                : 'bg-white dark:bg-slate-800 border border-border text-foreground hover:bg-muted'
            }`}
          >
            {s === 'ACTIVE' && <CheckCircle size={16} />}
            {s === 'INACTIVE' && <XCircle size={16} />}
            {s === 'ALL' ? 'Barchasi' : s === 'ACTIVE' ? 'Faol' : 'Nofaol'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">#</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">F.I.O</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Telefon</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Tavsiflar</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Tashriflar</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Holat</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {referrals.map((ref, idx) => (
              <tr key={ref.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {(pagination.page - 1) * pagination.limit + idx + 1}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-600 font-semibold text-sm">
                        {ref.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="font-semibold text-base text-foreground">{ref.full_name}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {ref.phone ? (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone size={13} />
                      {ref.phone}
                    </div>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                  {ref.description || <span className="text-muted-foreground/50">—</span>}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                    (ref._count?.visit_referrals ?? 0) > 0
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {ref._count?.visit_referrals ?? 0}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                    ref.status === 'ACTIVE'
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                  }`}>
                    {ref.status === 'ACTIVE' ? 'Faol' : 'Nofaol'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setEditReferral(ref); setShowModal(true); }}
                      className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteId(ref.id)}
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

        {referrals.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <Award size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-base">
              {searchInput ? `"${searchInput}" bo'yicha tavsiyachi topilmadi` : 'Tavsiyachilar topilmadi'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <PaginationBar
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={p => setPagination(prev => ({ ...prev, page: p }))}
          className="mt-3 mb-3"
        />
      )}

      {showModal && (
        <ReferralModal
          referral={editReferral}
          onClose={() => { setShowModal(false); setEditReferral(null); }}
          onSave={handleSave}
        />
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tavsiyachini o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Rostdan ham bu tavsiyachini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
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
