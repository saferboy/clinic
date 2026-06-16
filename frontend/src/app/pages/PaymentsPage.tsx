import { useState, useEffect, useCallback, useRef } from 'react';
import { BaseModal } from '../components/ui/BaseModal';
import { PaginationBar } from '../components/ui/PaginationBar';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import { Plus, ArrowUpRight, ArrowDownRight, TrendingUp, Trash2, Search } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  paymentsApi, BackendPayment, BackendPaymentType, PaymentSummary,
  BackendClientPaid, BackendOtherPaid, OtherPaidGroup,
} from '../api/payments.service';
import { clientsApi } from '../api/clients.service';
import { toast } from 'sonner';

type ActiveTab = 'payments' | 'client-paid' | 'other-paid';
const LIMIT = 20;

// ----------------------------------------------------------------
// Chart helper
// ----------------------------------------------------------------
const getChartData = (payments: BackendPayment[]) => {
  const days: Record<string, { date: string; kirim: number; chiqim: number }> = {};
  payments.forEach(p => {
    const day = p.payment_date.split('T')[0];
    if (!days[day]) days[day] = { date: day, kirim: 0, chiqim: 0 };
    const amount = parseFloat(p.amount);
    if (p.payment_type === 'INCOME') days[day].kirim += amount;
    else days[day].chiqim += amount;
  });
  return Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
};

// ----------------------------------------------------------------
// PaymentModal (umumiy to'lov)
// ----------------------------------------------------------------
interface PaymentForm {
  payment_type: BackendPaymentType;
  amount: string;
  description: string;
  payment_date: string;
}
function PaymentModal({ onClose, onSave, saving }: {
  onClose: () => void;
  onSave: (form: PaymentForm) => Promise<void>;
  saving: boolean;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState<PaymentForm>({
    payment_type: 'INCOME', amount: '', description: '', payment_date: today,
  });
  return (
    <BaseModal title="Yangi to'lov" onClose={onClose} size="md" footer={
      <>
        <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors disabled:opacity-50">Bekor qilish</button>
        <button onClick={() => form.amount && Number(form.amount) >= 1 && onSave(form)} disabled={saving || !form.amount || Number(form.amount) < 1} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium disabled:opacity-50">
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </>
    }>
      <div>
        <label className="text-sm font-medium mb-1 block">Yo'nalish *</label>
        <select value={form.payment_type} onChange={e => setForm({ ...form, payment_type: e.target.value as BackendPaymentType })}
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="INCOME">Kirim</option>
          <option value="OUTCOME">Chiqim</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Summa *</label>
          <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" min={1} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Sana</label>
          <input type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Tavsif</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          rows={2} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Izoh..." />
      </div>
    </BaseModal>
  );
}

// ----------------------------------------------------------------
// ClientPaidModal
// ----------------------------------------------------------------
interface ClientPaidForm {
  client_id: number | null;
  clientName: string;
  amount: string;
  description: string;
  payment_date: string;
}
function ClientPaidModal({ onClose, onSave, saving }: {
  onClose: () => void;
  onSave: (form: ClientPaidForm) => Promise<void>;
  saving: boolean;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState<ClientPaidForm>({
    client_id: null, clientName: '', amount: '', description: '', payment_date: today,
  });
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<{ id: number; full_name: string; phone: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClientSearch = (val: string) => {
    setClientSearch(val);
    setForm(f => ({ ...f, client_id: null, clientName: val }));
    if (searchRef.current) clearTimeout(searchRef.current);
    if (!val.trim()) { setClientResults([]); return; }
    searchRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await clientsApi.search({ full_name: val, limit: 5 });
        setClientResults(res.data || []);
      } catch { setClientResults([]); }
      finally { setSearching(false); }
    }, 300);
  };

  const selectClient = (c: { id: number; full_name: string; phone: string }) => {
    setForm(f => ({ ...f, client_id: c.id, clientName: c.full_name }));
    setClientSearch(c.full_name);
    setClientResults([]);
  };

  const canSave = form.client_id && form.amount && Number(form.amount) >= 1;
  return (
    <BaseModal title="Mijoz to'lovi" onClose={onClose} size="md" footer={
      <>
        <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors disabled:opacity-50">Bekor qilish</button>
        <button onClick={() => canSave && onSave(form)} disabled={saving || !canSave} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 font-medium disabled:opacity-50">
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </>
    }>
      <div className="relative">
        <label className="text-sm font-medium mb-1 block">Mijoz *</label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={clientSearch} onChange={e => handleClientSearch(e.target.value)}
            placeholder="Ism yoki telefon..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {(clientResults.length > 0 || searching) && (
          <div className="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-border rounded-xl shadow-lg overflow-hidden">
            {searching ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Qidirilmoqda...</div>
            ) : clientResults.map(c => (
              <button key={c.id} type="button" onClick={() => selectClient(c)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b border-border last:border-0">
                <div className="font-medium">{c.full_name}</div>
                <div className="text-xs text-muted-foreground">{c.phone}</div>
              </button>
            ))}
          </div>
        )}
        {form.client_id && (
          <div className="mt-1 text-xs text-green-600">✓ Tanlandi: {form.clientName}</div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Summa *</label>
          <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" min={1} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Sana</label>
          <input type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Tavsif</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          rows={2} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Izoh..." />
      </div>
    </BaseModal>
  );
}

// ----------------------------------------------------------------
// OtherPaidModal
// ----------------------------------------------------------------
interface OtherPaidForm {
  type: BackendPaymentType;
  amount: string;
  group_id: string;
  description: string;
  payment_date: string;
}
function OtherPaidModal({ groups, onClose, onSave, saving }: {
  groups: OtherPaidGroup[];
  onClose: () => void;
  onSave: (form: OtherPaidForm) => Promise<void>;
  saving: boolean;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState<OtherPaidForm>({
    type: 'OUTCOME', amount: '', group_id: '', description: '', payment_date: today,
  });
  const canSave = form.amount && Number(form.amount) >= 1;
  return (
    <BaseModal title="Boshqa to'lov" onClose={onClose} size="md" footer={
      <>
        <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors disabled:opacity-50">Bekor qilish</button>
        <button onClick={() => canSave && onSave(form)} disabled={saving || !canSave} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 font-medium disabled:opacity-50">
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </>
    }>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Yo'nalish *</label>
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as BackendPaymentType })}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="INCOME">Kirim</option>
            <option value="OUTCOME">Chiqim</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Guruh</label>
          <select value={form.group_id} onChange={e => setForm({ ...form, group_id: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— Tanlanmagan</option>
            {groups.map(g => <option key={g.id} value={String(g.id)}>{g.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Summa *</label>
          <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" min={1} />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Sana</label>
          <input type="date" value={form.payment_date} onChange={e => setForm({ ...form, payment_date: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Tavsif</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          rows={2} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Izoh..." />
      </div>
    </BaseModal>
  );
}

// ----------------------------------------------------------------
// Main Page
// ----------------------------------------------------------------
export function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('payments');
  const [summary, setSummary] = useState<PaymentSummary | null>(null);

  // Payments tab
  const [payments, setPayments] = useState<BackendPayment[]>([]);
  const [pLoading, setPLoading] = useState(true);
  const [pTypeFilter, setPTypeFilter] = useState('');
  const [pDateFrom, setPDateFrom] = useState('');
  const [pDateTo, setPDateTo] = useState('');
  const [pPage, setPPage] = useState(1);
  const [pTotal, setPTotal] = useState(0);
  const [pTotalPages, setPTotalPages] = useState(1);
  const pAbortRef = useRef<AbortController | null>(null);

  // ClientPaid tab
  const [clientPaid, setClientPaid] = useState<BackendClientPaid[]>([]);
  const [cpLoading, setCpLoading] = useState(false);
  const [cpDateFrom, setCpDateFrom] = useState('');
  const [cpDateTo, setCpDateTo] = useState('');
  const [cpPage, setCpPage] = useState(1);
  const [cpTotal, setCpTotal] = useState(0);
  const [cpTotalPages, setCpTotalPages] = useState(1);
  const cpAbortRef = useRef<AbortController | null>(null);

  // OtherPaid tab
  const [otherPaid, setOtherPaid] = useState<BackendOtherPaid[]>([]);
  const [opLoading, setOpLoading] = useState(false);
  const [opTypeFilter, setOpTypeFilter] = useState('');
  const [opDateFrom, setOpDateFrom] = useState('');
  const [opDateTo, setOpDateTo] = useState('');
  const [opPage, setOpPage] = useState(1);
  const [opTotal, setOpTotal] = useState(0);
  const [opTotalPages, setOpTotalPages] = useState(1);
  const [groups, setGroups] = useState<OtherPaidGroup[]>([]);
  const opAbortRef = useRef<AbortController | null>(null);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ tab: ActiveTab; id: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Summary
  const refreshSummary = () => {
    paymentsApi.getSummary().then(res => { if (res.success) setSummary(res.data); }).catch(() => {});
  };

  useEffect(() => { refreshSummary(); }, []);

  // Load groups (once)
  useEffect(() => {
    paymentsApi.getOtherPaidGroups().then(res => { if (res.success) setGroups(res.data); }).catch(() => {});
  }, []);

  // ---- Payments ----
  const loadPayments = useCallback(async () => {
    if (pAbortRef.current) pAbortRef.current.abort();
    pAbortRef.current = new AbortController();
    const { signal } = pAbortRef.current;
    setPLoading(true);
    try {
      const res = await paymentsApi.getPayments({
        payment_type: pTypeFilter || undefined,
        date_from: pDateFrom || undefined,
        date_to: pDateTo || undefined,
        page: pPage,
        limit: LIMIT,
      });
      if (signal.aborted) return;
      if (res.success) {
        setPayments(res.data.data);
        setPTotal(res.data.total);
        setPTotalPages(res.data.totalPages || 1);
      }
    } catch (err: any) {
      if (signal.aborted) return;
      toast.error(err?.message || 'Xatolik');
    } finally {
      if (!signal.aborted) setPLoading(false);
    }
  }, [pTypeFilter, pDateFrom, pDateTo, pPage]);

  useEffect(() => {
    if (activeTab === 'payments') loadPayments();
    return () => pAbortRef.current?.abort();
  }, [loadPayments, activeTab]);

  // ---- ClientPaid ----
  const loadClientPaid = useCallback(async () => {
    if (cpAbortRef.current) cpAbortRef.current.abort();
    cpAbortRef.current = new AbortController();
    const { signal } = cpAbortRef.current;
    setCpLoading(true);
    try {
      const res = await paymentsApi.getClientPaid({
        page: cpPage,
        limit: LIMIT,
        date_from: cpDateFrom || undefined,
        date_to: cpDateTo || undefined,
      });
      if (signal.aborted) return;
      if (res.success) {
        setClientPaid(res.data.data);
        setCpTotal(res.data.total);
        setCpTotalPages(Math.ceil(res.data.total / LIMIT) || 1);
      }
    } catch (err: any) {
      if (signal.aborted) return;
      toast.error(err?.message || 'Xatolik');
    } finally {
      if (!signal.aborted) setCpLoading(false);
    }
  }, [cpPage, cpDateFrom, cpDateTo]);

  useEffect(() => {
    if (activeTab === 'client-paid') loadClientPaid();
    return () => cpAbortRef.current?.abort();
  }, [loadClientPaid, activeTab]);

  // ---- OtherPaid ----
  const loadOtherPaid = useCallback(async () => {
    if (opAbortRef.current) opAbortRef.current.abort();
    opAbortRef.current = new AbortController();
    const { signal } = opAbortRef.current;
    setOpLoading(true);
    try {
      const res = await paymentsApi.getOtherPaid({
        type: opTypeFilter || undefined,
        page: opPage,
        limit: LIMIT,
        date_from: opDateFrom || undefined,
        date_to: opDateTo || undefined,
      });
      if (signal.aborted) return;
      if (res.success) {
        setOtherPaid(res.data.data);
        setOpTotal(res.data.total);
        setOpTotalPages(Math.ceil(res.data.total / LIMIT) || 1);
      }
    } catch (err: any) {
      if (signal.aborted) return;
      toast.error(err?.message || 'Xatolik');
    } finally {
      if (!signal.aborted) setOpLoading(false);
    }
  }, [opTypeFilter, opPage, opDateFrom, opDateTo]);

  useEffect(() => {
    if (activeTab === 'other-paid') loadOtherPaid();
    return () => opAbortRef.current?.abort();
  }, [loadOtherPaid, activeTab]);

  // ---- Save handlers ----
  const handlePaymentSave = async (form: PaymentForm) => {
    setSaving(true);
    try {
      await paymentsApi.createPayment({
        payment_type: form.payment_type,
        amount: Number(form.amount),
        description: form.description || undefined,
        payment_date: form.payment_date ? new Date(form.payment_date).toISOString() : undefined,
      });
      toast.success("To'lov qo'shildi");
      setShowModal(false);
      setPPage(1);
      loadPayments();
      refreshSummary();
    } catch (err: any) {
      toast.error(err?.message || "Saqlashda xato");
    } finally {
      setSaving(false);
    }
  };

  const handleClientPaidSave = async (form: ClientPaidForm) => {
    if (!form.client_id) return;
    setSaving(true);
    try {
      await paymentsApi.createClientPaid({
        client_id: form.client_id,
        amount: Number(form.amount),
        description: form.description || undefined,
        payment_date: form.payment_date ? new Date(form.payment_date).toISOString() : undefined,
      });
      toast.success("Mijoz to'lovi qo'shildi");
      setShowModal(false);
      setCpPage(1);
      loadClientPaid();
      refreshSummary();
    } catch (err: any) {
      toast.error(err?.message || "Saqlashda xato");
    } finally {
      setSaving(false);
    }
  };

  const handleOtherPaidSave = async (form: OtherPaidForm) => {
    setSaving(true);
    try {
      await paymentsApi.createOtherPaid({
        type: form.type,
        amount: Number(form.amount),
        group_id: form.group_id ? Number(form.group_id) : undefined,
        description: form.description || undefined,
        payment_date: form.payment_date ? new Date(form.payment_date).toISOString() : undefined,
      });
      toast.success("To'lov qo'shildi");
      setShowModal(false);
      setOpPage(1);
      loadOtherPaid();
      refreshSummary();
    } catch (err: any) {
      toast.error(err?.message || "Saqlashda xato");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.tab === 'payments') {
        await paymentsApi.deletePayment(deleteTarget.id);
        loadPayments();
      } else if (deleteTarget.tab === 'client-paid') {
        await paymentsApi.deleteClientPaid(deleteTarget.id);
        loadClientPaid();
      } else {
        await paymentsApi.deleteOtherPaid(deleteTarget.id);
        loadOtherPaid();
      }
      toast.success("O'chirildi");
      refreshSummary();
    } catch (err: any) {
      toast.error(err?.message || "O'chirishda xato");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Derived
  const totalIncome = summary?.totalIncome ?? 0;
  const totalOutcome = summary?.totalOutcome ?? 0;
  const balance = summary?.netBalance ?? 0;
  const chartData = getChartData(payments);

  const TAB_LABELS: Record<ActiveTab, string> = {
    'payments': "Umumiy to'lovlar",
    'client-paid': "Mijoz to'lovlari",
    'other-paid': "Boshqa to'lovlar",
  };

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <div className="p-2.5 bg-green-50 dark:bg-green-900/30 rounded-xl w-fit mb-3">
            <ArrowDownRight size={20} className="text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Jami kirim</div>
          {summary?.by_type && (
            <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
              <div>To'lov: {formatCurrency(summary.by_type.payment.income)}</div>
              <div>Mijoz: {formatCurrency(summary.by_type.client_paid.income)}</div>
              <div>Boshqa: {formatCurrency(summary.by_type.other_paid.income)}</div>
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <div className="p-2.5 bg-red-50 dark:bg-red-900/30 rounded-xl w-fit mb-3">
            <ArrowUpRight size={20} className="text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOutcome)}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Jami chiqim</div>
          {summary?.by_type && (
            <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
              <div>To'lov: {formatCurrency(summary.by_type.payment.outcome)}</div>
              <div>Boshqa: {formatCurrency(summary.by_type.other_paid.outcome)}</div>
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl w-fit mb-3">
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">Sof foyda</div>
          {summary && (
            <div className="mt-2 text-xs text-muted-foreground">Jami: {summary.count} ta yozuv</div>
          )}
        </div>
      </div>

      {/* Chart (only payments tab) */}
      {activeTab === 'payments' && chartData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm p-5">
          <h3 className="font-semibold text-foreground mb-1">Kirim / Chiqim dinamikasi</h3>
          <p className="text-xs text-muted-foreground mb-4">Kunlik ko'rsatkichlar</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(val: number) => formatCurrency(val)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="kirim" name="Kirim" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="chiqim" name="Chiqim" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabs + Toolbar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Tab nav */}
        <div className="flex items-center justify-between border-b border-border px-4">
          <div className="flex">
            {(Object.keys(TAB_LABELS) as ActiveTab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium">
            <Plus size={14} />
            Yangi
          </button>
        </div>

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <>
            <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-border">
              <select value={pTypeFilter} onChange={e => { setPTypeFilter(e.target.value); setPPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none">
                <option value="">Barcha yo'nalish</option>
                <option value="INCOME">Kirim</option>
                <option value="OUTCOME">Chiqim</option>
              </select>
              <input type="date" value={pDateFrom} onChange={e => { setPDateFrom(e.target.value); setPPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none" />
              <input type="date" value={pDateTo} onChange={e => { setPDateTo(e.target.value); setPPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none" />
              {(pTypeFilter || pDateFrom || pDateTo) && (
                <button onClick={() => { setPTypeFilter(''); setPDateFrom(''); setPDateTo(''); setPPage(1); }}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted">
                  Tozalash
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sana</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Mijoz</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tavsif</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Summa</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Yo'nalish</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Kim</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {pLoading ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Yuklanmoqda...</td></tr>
                  ) : payments.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">To'lovlar topilmadi</td></tr>
                  ) : payments.map((p, idx) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-xs">{(pPage - 1) * LIMIT + idx + 1}</td>
                      <td className="px-4 py-3 text-xs">
                        <div>{formatDate(p.payment_date)}</div>
                        <div className="text-muted-foreground" style={{ fontSize: 10 }}>{formatTime(p.payment_date)}</div>
                      </td>
                      <td className="px-4 py-3 font-medium">{p.client?.full_name || <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-[180px] truncate">{p.description || '—'}</td>
                      <td className="px-4 py-3 font-semibold">
                        <span className={p.payment_type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                          {p.payment_type === 'INCOME' ? '+' : '-'}{formatCurrency(parseFloat(p.amount))}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.payment_type === 'INCOME' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {p.payment_type === 'INCOME' ? 'Kirim' : 'Chiqim'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{p.register_user?.full_name || '—'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDeleteTarget({ tab: 'payments', id: p.id })}
                          className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-muted-foreground transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <div className="text-xs text-muted-foreground">Jami {pTotal} ta</div>
              {pTotalPages > 1 && (
                <PaginationBar page={pPage} totalPages={pTotalPages} total={pTotal} limit={LIMIT} onPageChange={setPPage} />
              )}
            </div>
          </>
        )}

        {/* ClientPaid Tab */}
        {activeTab === 'client-paid' && (
          <>
            <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-border">
              <input type="date" value={cpDateFrom} onChange={e => { setCpDateFrom(e.target.value); setCpPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none" />
              <input type="date" value={cpDateTo} onChange={e => { setCpDateTo(e.target.value); setCpPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none" />
              {(cpDateFrom || cpDateTo) && (
                <button onClick={() => { setCpDateFrom(''); setCpDateTo(''); setCpPage(1); }}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted">
                  Tozalash
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sana</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Mijoz</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tavsif</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Summa</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {cpLoading ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Yuklanmoqda...</td></tr>
                  ) : clientPaid.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">To'lovlar topilmadi</td></tr>
                  ) : clientPaid.map((p, idx) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-xs">{(cpPage - 1) * LIMIT + idx + 1}</td>
                      <td className="px-4 py-3 text-xs">
                        <div>{formatDate(p.payment_date)}</div>
                        <div className="text-muted-foreground" style={{ fontSize: 10 }}>{formatTime(p.payment_date)}</div>
                      </td>
                      <td className="px-4 py-3 font-medium">{p.client?.full_name || <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">{p.description || '—'}</td>
                      <td className="px-4 py-3 font-semibold text-green-600">+{formatCurrency(parseFloat(p.amount))}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDeleteTarget({ tab: 'client-paid', id: p.id })}
                          className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-muted-foreground transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <div className="text-xs text-muted-foreground">Jami {cpTotal} ta</div>
              {cpTotalPages > 1 && (
                <PaginationBar page={cpPage} totalPages={cpTotalPages} total={cpTotal} limit={LIMIT} onPageChange={setCpPage} />
              )}
            </div>
          </>
        )}

        {/* OtherPaid Tab */}
        {activeTab === 'other-paid' && (
          <>
            <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-border">
              <select value={opTypeFilter} onChange={e => { setOpTypeFilter(e.target.value); setOpPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none">
                <option value="">Barcha yo'nalish</option>
                <option value="INCOME">Kirim</option>
                <option value="OUTCOME">Chiqim</option>
              </select>
              <input type="date" value={opDateFrom} onChange={e => { setOpDateFrom(e.target.value); setOpPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none" />
              <input type="date" value={opDateTo} onChange={e => { setOpDateTo(e.target.value); setOpPage(1); }}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none" />
              {(opTypeFilter || opDateFrom || opDateTo) && (
                <button onClick={() => { setOpTypeFilter(''); setOpDateFrom(''); setOpDateTo(''); setOpPage(1); }}
                  className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted">
                  Tozalash
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sana</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Guruh</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tavsif</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Summa</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Yo'nalish</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {opLoading ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Yuklanmoqda...</td></tr>
                  ) : otherPaid.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">To'lovlar topilmadi</td></tr>
                  ) : otherPaid.map((p, idx) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-xs">{(opPage - 1) * LIMIT + idx + 1}</td>
                      <td className="px-4 py-3 text-xs">
                        <div>{formatDate(p.payment_date)}</div>
                        <div className="text-muted-foreground" style={{ fontSize: 10 }}>{formatTime(p.payment_date)}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">{p.group?.name || <span className="text-muted-foreground">—</span>}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-[180px] truncate">{p.description || '—'}</td>
                      <td className="px-4 py-3 font-semibold">
                        <span className={p.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                          {p.type === 'INCOME' ? '+' : '-'}{formatCurrency(parseFloat(p.amount))}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.type === 'INCOME' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {p.type === 'INCOME' ? 'Kirim' : 'Chiqim'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDeleteTarget({ tab: 'other-paid', id: p.id })}
                          className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-muted-foreground transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <div className="text-xs text-muted-foreground">Jami {opTotal} ta</div>
              {opTotalPages > 1 && (
                <PaginationBar page={opPage} totalPages={opTotalPages} total={opTotal} limit={LIMIT} onPageChange={setOpPage} />
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showModal && activeTab === 'payments' && (
        <PaymentModal onClose={() => setShowModal(false)} onSave={handlePaymentSave} saving={saving} />
      )}
      {showModal && activeTab === 'client-paid' && (
        <ClientPaidModal onClose={() => setShowModal(false)} onSave={handleClientPaidSave} saving={saving} />
      )}
      {showModal && activeTab === 'other-paid' && (
        <OtherPaidModal groups={groups} onClose={() => setShowModal(false)} onSave={handleOtherPaidSave} saving={saving} />
      )}

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>O'chirishni tasdiqlang</AlertDialogTitle>
            <AlertDialogDescription>Bu to'lov yozuvini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white">
              {deleting ? "O'chirilmoqda..." : "O'chirish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
