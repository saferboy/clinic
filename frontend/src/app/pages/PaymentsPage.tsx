import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  X,
  Printer,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  paymentsApi,
  BackendPayment,
  BackendPaymentType,
  PaymentSummary,
} from '../api/payments.service';

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
const formatCurrency = (v: number) => `${v.toLocaleString('uz-UZ')} so'm`;

const getChartData = (payments: BackendPayment[]) => {
  const days: Record<string, { date: string; kirim: number; chiqim: number }> =
    {};
  payments.forEach((p) => {
    const day = p.payment_date.split('T')[0];
    if (!days[day]) days[day] = { date: day, kirim: 0, chiqim: 0 };
    const amount = parseFloat(p.amount);
    if (p.payment_type === 'INCOME') days[day].kirim += amount;
    else days[day].chiqim += amount;
  });
  return Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
};

// ----------------------------------------------------------------
// Modal
// ----------------------------------------------------------------
interface ModalForm {
  payment_type: BackendPaymentType;
  amount: string;
  description: string;
  payment_date: string;
}

function PaymentModal({
  onClose,
  onSave,
  saving,
}: {
  onClose: () => void;
  onSave: (form: ModalForm) => Promise<void>;
  saving: boolean;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState<ModalForm>({
    payment_type: 'INCOME',
    amount: '',
    description: '',
    payment_date: today,
  });

  const handleSave = async () => {
    if (!form.amount || Number(form.amount) < 1) return;
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Yangi to'lov</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Yo'nalish *</label>
            <select
              value={form.payment_type}
              onChange={(e) =>
                setForm({ ...form, payment_type: e.target.value as BackendPaymentType })
              }
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="INCOME">Kirim</option>
              <option value="OUTCOME">Chiqim</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Summa *</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min={1}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Sana</label>
              <input
                type="date"
                value={form.payment_date}
                onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Tavsif</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="To'lov uchun izoh..."
            />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.amount || Number(form.amount) < 1}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// Main Page
// ----------------------------------------------------------------
export function PaymentsPage() {
  const [payments, setPayments] = useState<BackendPayment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const LIMIT = 20;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [paymentsRes, summaryRes] = await Promise.all([
        paymentsApi.getPayments({
          payment_type: typeFilter || undefined,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
          page,
          limit: LIMIT,
        }),
        paymentsApi.getSummary(dateFrom || undefined, dateTo || undefined),
      ]);

      if (paymentsRes.success) {
        setPayments(paymentsRes.data.data);
        setTotal(paymentsRes.data.total);
        setTotalPages(paymentsRes.data.totalPages);
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data);
      }
    } catch (err: any) {
      setError(err?.message || "Ma'lumotlarni yuklashda xato");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (form: ModalForm) => {
    setSaving(true);
    try {
      await paymentsApi.createPayment({
        payment_type: form.payment_type,
        amount: Number(form.amount),
        description: form.description || undefined,
        payment_date: form.payment_date
          ? new Date(form.payment_date).toISOString()
          : undefined,
      });
      setShowModal(false);
      setPage(1);
      await loadData();
    } catch (err: any) {
      alert(err?.message || "To'lovni saqlashda xato");
    } finally {
      setSaving(false);
    }
  };

  // Client-side search filter (search by description or client name)
  const filtered = payments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (p.description || '').toLowerCase().includes(q) ||
      (p.client?.full_name || '').toLowerCase().includes(q)
    );
  });

  const chartData = getChartData(filtered);

  const totalIncome = summary?.totalIncome ?? 0;
  const totalOutcome = summary?.totalOutcome ?? 0;
  const balance = summary?.netBalance ?? 0;

  const filteredIncome = filtered
    .filter((p) => p.payment_type === 'INCOME')
    .reduce((s, p) => s + parseFloat(p.amount), 0);
  const filteredOutcome = filtered
    .filter((p) => p.payment_type === 'OUTCOME')
    .reduce((s, p) => s + parseFloat(p.amount), 0);

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-50 dark:bg-green-900/30 rounded-xl">
              <ArrowDownRight size={20} className="text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">Jami kirim</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-red-50 dark:bg-red-900/30 rounded-xl">
              <ArrowUpRight size={20} className="text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalOutcome)}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">Jami chiqim</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
          </div>
          <div
            className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}
          >
            {formatCurrency(balance)}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">Sof foyda</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm p-5">
        <h3 className="font-semibold text-foreground mb-1">
          Kirim / Chiqim dinamikasi
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Kunlik ko'rsatkichlar</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip formatter={(val: number) => formatCurrency(val)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="kirim" name="Kirim" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="chiqim" name="Chiqim" fill="#f87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mijoz yoki tavsif bo'yicha qidirish..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none"
          >
            <option value="">Barcha yo'nalish</option>
            <option value="INCOME">Kirim</option>
            <option value="OUTCOME">Chiqim</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none"
            placeholder="Dan"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none"
            placeholder="Gacha"
          />
          <button className="px-4 py-2.5 border border-border bg-white dark:bg-slate-800 rounded-xl text-sm flex items-center gap-2 hover:bg-muted transition-colors">
            <Download size={16} />
            <span className="hidden sm:inline">Eksport</span>
          </button>
          <button className="px-4 py-2.5 border border-border bg-white dark:bg-slate-800 rounded-xl text-sm flex items-center gap-2 hover:bg-muted transition-colors">
            <Printer size={16} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Yangi to'lov</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Sana
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Mijoz
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Tavsif
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Summa
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Yo'nalish
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Kim tomonidan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    To'lovlar topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((payment, idx) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {(page - 1) * LIMIT + idx + 1}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(payment.payment_date).toLocaleDateString('uz-UZ')}
                      <div className="text-muted-foreground" style={{fontSize:'10px'}}>
                        {new Date(payment.payment_date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">
                        {payment.client?.full_name || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">
                      {payment.description || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          payment.payment_type === 'INCOME'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {payment.payment_type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(parseFloat(payment.amount))}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          payment.payment_type === 'INCOME'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {payment.payment_type === 'INCOME' ? 'Kirim' : 'Chiqim'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {payment.register_user?.full_name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
                        <Printer size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Jami {total} ta to'lov
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 text-xs">
              <span className="text-green-600 font-medium">
                Kirim: {formatCurrency(filteredIncome)}
              </span>
              <span className="text-red-600 font-medium">
                Chiqim: {formatCurrency(filteredOutcome)}
              </span>
            </div>
            {/* Pagination */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs text-muted-foreground px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <PaymentModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
