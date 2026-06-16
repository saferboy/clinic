import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { Plus, Edit, Trash2, Search, Phone, Eye, User, Download } from 'lucide-react';
import { BaseModal } from '../components/ui/BaseModal';
import { PaginationBar } from '../components/ui/PaginationBar';
import { formatCurrency, formatDate } from '../utils/formatters';
import { clientsApi, Client, ClientStats } from '../api/clients.service';
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

function ClientModal({ client, groups, sources, onClose, onSave }: {
  client: Partial<Client> | null;
  groups: { id: number; name: string }[];
  sources: Source[];
  onClose: () => void;
  onSave: (dto: any) => void;
}) {
  const [form, setForm] = useState({
    full_name: client?.full_name || '',
    phone: client?.phone || '',
    gender: client?.gender || 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    date_of_birth: client?.date_of_birth ? client.date_of_birth.split('T')[0] : '',
    address: client?.address || '',
    description: client?.description || '',
    status: client?.status || 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED',
    group_id: client?.group_id ?? '',
    source_id: client?.source_id ?? '',
  });

  return (
    <BaseModal
      title={client?.id ? 'Mijozni tahrirlash' : 'Yangi mijoz'}
      onClose={onClose}
      size="lg"
      onSave={() => onSave(form)}
    >
      <div>
        <label className="text-sm font-medium mb-1 block">To'liq ism *</label>
        <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ism familiya" />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Telefon *</label>
        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+998901234567" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Jins</label>
          <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="MALE">Erkak</option>
            <option value="FEMALE">Ayol</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Tug'ilgan sana</label>
          <input type="date" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Manzil</label>
        <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Shahar, tuman" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Guruh</label>
          <select value={form.group_id} onChange={e => setForm({ ...form, group_id: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— Guruhsiz —</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Manba</label>
          <select value={form.source_id} onChange={e => setForm({ ...form, source_id: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— Manbasiz —</option>
            {sources.filter(s => s.status === 'ACTIVE').map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Qo'shimcha ma'lumot</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Izoh" />
      </div>
    </BaseModal>
  );
}

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<Partial<Client> | null>(null);
  const [deleteClientId, setDeleteClientId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);
  const [pagination, setPagination] = useState({ page: 1, limit: 7, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'>('ALL');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');
  const [groupFilter, setGroupFilter] = useState<number | 'ALL'>('ALL');
  const [groups, setGroups] = useState<{ id: number; name: string }[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [stats, setStats] = useState<ClientStats>({ total: 0, active: 0, inactive: 0, archived: 0, male: 0, female: 0, debt: 0 });
  const fetchAbortRef = useRef<AbortController | null>(null);

  const fetchClients = async () => {
    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    fetchAbortRef.current = new AbortController();
    const { signal } = fetchAbortRef.current;
    try {
      setLoading(true);
      const response = await clientsApi.findMany({
        page: pagination.page,
        limit: pagination.limit,
        full_name: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        gender: genderFilter !== 'ALL' ? genderFilter : undefined,
        group_id: groupFilter !== 'ALL' ? groupFilter : undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      if (signal.aborted) return;
      const backendData = response as any;
      setClients(Array.isArray(backendData?.data) ? backendData.data : []);
      if (backendData?.pagination) {
        setPagination(prev => ({ ...prev, ...backendData.pagination }));
      }
    } catch (error) {
      if (signal.aborted) return;
      console.error("Mijozlarni yuklashda xatolik:", error);
      toast.error("Mijozlarni yuklashda xatolik yuz berdi");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await clientsApi.getStats();
      const backendData = response as any;
      if (backendData?.data) setStats(backendData.data);
    } catch (error) {
      console.error("Statistikani yuklashda xatolik:", error);
    }
  };

  useEffect(() => {
    setPagination(p => ({ ...p, page: 1 }));
  }, [search]);

  useEffect(() => {
    fetchClients();
    fetchStats();
    return () => fetchAbortRef.current?.abort();
  }, [pagination.page, search, statusFilter, genderFilter, groupFilter]);

  useEffect(() => {
    clientsApi.getGroups().then(res => {
      setGroups(res.data.data);
    }).catch(() => {});
    sourcesApi.findMany().then(res => {
      setSources(res.data);
    }).catch(() => {});
  }, []);

  const handleSave = async (form: any) => {
    try {
      const dto = {
        ...form,
        group_id: form.group_id !== '' ? Number(form.group_id) : undefined,
        source_id: form.source_id !== '' ? Number(form.source_id) : undefined,
      };
      if (editClient?.id) {
        await clientsApi.update(editClient.id, dto);
        toast.success("Mijoz muvaffaqiyatli yangilandi");
      } else {
        await clientsApi.create(dto);
        toast.success("Yangi mijoz muvaffaqiyatli yaratildi");
      }
      setShowModal(false);
      setEditClient(null);
      fetchClients();
      fetchStats();
    } catch (error: any) {
      console.error("Mijozni saqlashda xatolik:", error);
      const raw = error?.data?.message;
      if (Array.isArray(raw) && raw.length > 0) {
        toast.error(raw.join('\n'), { duration: 6000 });
      } else if (typeof raw === 'string' && raw) {
        toast.error(raw, { duration: 5000 });
      } else if (error?.message?.includes('Network Error') || error?.message?.includes('fetch')) {
        toast.error("Tarmoq xatosi: Serverga ulanib bo'lmadi", { duration: 5000 });
      } else {
        toast.error("Mijozni saqlashda xatolik yuz berdi", { duration: 5000 });
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await clientsApi.remove(id);
      toast.success("Mijoz muvaffaqiyatli o'chirildi");
      setDeleteClientId(null);
      fetchClients();
      fetchStats();
    } catch (error: any) {
      console.error("Mijozni o'chirishda xatolik:", error);
      let message = "Mijozni o'chirishda xatolik yuz berdi";
      if (error?.data?.message) {
        message = error.data.message;
      } else if (error?.message) {
        message = error.message;
      }
      toast.error(message, { duration: 5000 });
    }
  };

  const toggleSelect = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('access_token');

      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (genderFilter !== 'ALL') params.append('gender', genderFilter);
      if (groupFilter !== 'ALL') params.append('group_id', String(groupFilter));
      if (search) params.append('full_name', search);

      const queryString = params.toString();
      const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/clients/export${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Eksportda xatolik');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `mijozlar-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Excel fayli yuklandi');
    } catch (error: any) {
      console.error('Eksportda xatolik:', error);
      toast.error(error.message || 'Eksportda xatolik yuz berdi');
    } finally {
      setExporting(false);
    }
  };

  const paged = clients;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Yuklanmoqda...</div></div>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={e => { setSearchInput(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            placeholder="Ism yoki telefon bo'yicha qidirish..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setPagination(p => ({ ...p, page: 1 })); }}
            className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="ALL">Barcha holat</option>
            <option value="ACTIVE">Faol</option>
            <option value="INACTIVE">Nofaol</option>
            <option value="ARCHIVED">Arxiv</option>
          </select>
          <select value={genderFilter} onChange={e => { setGenderFilter(e.target.value as any); setPagination(p => ({ ...p, page: 1 })); }}
            className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="ALL">Barcha jins</option>
            <option value="MALE">Erkak</option>
            <option value="FEMALE">Ayol</option>
          </select>
          <select value={groupFilter} onChange={e => { setGroupFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)); setPagination(p => ({ ...p, page: 1 })); }}
            className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="ALL">Barcha guruh</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <button
            onClick={() => { setEditClient(null); setShowModal(true); }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Yangi mijoz</span>
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm hover:bg-green-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Jami', value: stats.total, color: 'text-foreground' },
          { label: 'Faol', value: stats.active, color: 'text-green-600' },
          { label: 'Qarzdor', value: stats.debt, color: 'text-red-600' },
          { label: 'Erkak', value: stats.male, color: 'text-blue-600' },
          { label: 'Ayol', value: stats.female, color: 'text-pink-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-border text-center">
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.length === paged.length && paged.length > 0}
                    onChange={e => setSelected(e.target.checked ? paged.map(c => c.id) : [])}
                    className="rounded" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Mijoz</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Telefon</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Guruh</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Manba</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Balans</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Tashriflar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Holat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(client => (
                <tr key={client.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.includes(client.id)}
                      onChange={() => toggleSelect(client.id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0">
                        {client.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{client.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {client.gender === 'MALE' ? 'Erkak' : 'Ayol'}
                          {client.date_of_birth && ` · ${formatDate(client.date_of_birth)}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{client.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      client.group?.name === 'VIP' ? 'bg-amber-100 text-amber-700' :
                      client.group?.name === 'Korporativ' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{client.group?.name || 'Oddiy'}</span>
                  </td>
                  <td className="px-4 py-3">
                    {client.source ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        {client.source.name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium text-sm ${client.balance < 0 ? 'text-red-600' : client.balance > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {client.balance < 0 ? '-' : ''}{formatCurrency(client.balance)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-foreground font-medium">{client._count?.visits || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      client.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      client.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {client.status === 'ACTIVE' ? 'Faol' : client.status === 'ARCHIVED' ? 'Arxiv' : 'Nofaol'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {/* TODO: Qo'ng'iroq funksiyasi keyinroq qo'shiladi
                      <button title="Qo'ng'iroq" className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-green-600 transition-colors">
                        <Phone size={15} />
                      </button>
                      */}
                      <button title="Ko'rish" className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-600 transition-colors">
                        <Eye size={15} />
                      </button>
                      <button
                        title="Tahrirlash"
                        onClick={() => { setEditClient(client); setShowModal(true); }}
                        className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        title="O'chirish"
                        onClick={() => setDeleteClientId(client.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
        <ClientModal
          client={editClient}
          groups={groups}
          sources={sources}
          onClose={() => { setShowModal(false); setEditClient(null); }}
          onSave={handleSave}
        />
      )}

      <AlertDialog open={deleteClientId !== null} onOpenChange={(open) => !open && setDeleteClientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mijozni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Rostdan ham bu mijozni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteClientId && handleDelete(deleteClientId)}
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
