import { useState } from 'react';
import { Plus, Search, Download, ArrowUpRight, ArrowDownRight, TrendingUp, X, Printer } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { mockPayments, formatCurrency, getStatusColor, getStatusLabel } from '../mockData';
import { Payment, PaymentType } from '../types';

function PaymentModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (p: Partial<Payment>) => void;
}) {
  const [form, setForm] = useState<Partial<Payment>>({
    clientName: '', amount: 0, type: 'cash', direction: 'income',
    description: '', date: '2026-04-03'
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Yangi to'lov</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Mijoz</label>
            <input value={form.clientName || ''} onChange={e => setForm({ ...form, clientName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Mijoz ismi" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Summa *</label>
              <input type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">To'lov turi</label>
              <select value={form.type || 'cash'} onChange={e => setForm({ ...form, type: e.target.value as PaymentType })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="cash">Naqd</option>
                <option value="card">Karta</option>
                <option value="transfer">O'tkazma</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Yo'nalish</label>
              <select value={form.direction || 'income'} onChange={e => setForm({ ...form, direction: e.target.value as 'income' | 'outcome' })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="income">Kirim</option>
                <option value="outcome">Chiqim</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Sana</label>
              <input type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Tavsif</label>
            <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="To'lov uchun izoh..." />
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

// Group payments by day for chart
const getChartData = (payments: Payment[]) => {
  const days: Record<string, { date: string; kirim: number; chiqim: number }> = {};
  payments.forEach(p => {
    if (!days[p.date]) days[p.date] = { date: p.date, kirim: 0, chiqim: 0 };
    if (p.direction === 'income') days[p.date].kirim += p.amount;
    else days[p.date].chiqim += p.amount;
  });
  return Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
};

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [search, setSearch] = useState('');
  const [dirFilter, setDirFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = payments.filter(p => {
    const matchSearch = p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchDir = dirFilter === 'all' || p.direction === dirFilter;
    const matchType = typeFilter === 'all' || p.type === typeFilter;
    const matchDate = !dateFilter || p.date === dateFilter;
    return matchSearch && matchDir && matchType && matchDate;
  });

  const totalIncome = payments.filter(p => p.direction === 'income').reduce((s, p) => s + p.amount, 0);
  const totalOutcome = payments.filter(p => p.direction === 'outcome').reduce((s, p) => s + p.amount, 0);
  const balance = totalIncome - totalOutcome;

  const handleSave = (form: Partial<Payment>) => {
    const newPayment: Payment = {
      ...form as Payment,
      id: 'p' + Date.now(),
      clientId: 'c0',
      visitId: '',
      createdBy: 'Admin',
    };
    setPayments(prev => [newPayment, ...prev]);
    setShowModal(false);
  };

  const chartData = getChartData(payments);

  const paymentTypeIcon = (type: string) => {
    return type === 'cash' ? '💵' : type === 'card' ? '💳' : '🏦';
  };

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-green-50 dark:bg-green-900/30 rounded-xl">
              <ArrowDownRight size={20} className="text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+15%</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Jami kirim</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-red-50 dark:bg-red-900/30 rounded-xl">
              <ArrowUpRight size={20} className="text-red-600" />
            </div>
            <span className="text-xs text-red-600 font-medium">+8%</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOutcome)}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Jami chiqim</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
          </div>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(balance)}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Sof foyda</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm p-5">
        <h3 className="font-semibold text-foreground mb-1">Kirim / Chiqim dinamikasi</h3>
        <p className="text-xs text-muted-foreground mb-4">Kunlik ko'rsatkichlar</p>
        <ResponsiveContainer width="100%" height={200}>
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

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Mijoz yoki tavsif bo'yicha qidirish..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={dirFilter} onChange={e => setDirFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none">
            <option value="all">Barcha yo'nalish</option>
            <option value="income">Kirim</option>
            <option value="outcome">Chiqim</option>
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none">
            <option value="all">Barcha tur</option>
            <option value="cash">Naqd</option>
            <option value="card">Karta</option>
            <option value="transfer">O'tkazma</option>
          </select>
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none" />
          <button className="px-4 py-2.5 border border-border bg-white dark:bg-slate-800 rounded-xl text-sm flex items-center gap-2 hover:bg-muted transition-colors">
            <Download size={16} />
            <span className="hidden sm:inline">Eksport</span>
          </button>
          <button className="px-4 py-2.5 border border-border bg-white dark:bg-slate-800 rounded-xl text-sm flex items-center gap-2 hover:bg-muted transition-colors">
            <Printer size={16} />
          </button>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium">
            <Plus size={16} />
            <span className="hidden sm:inline">Yangi to'lov</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sana</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Mijoz</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tavsif</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tur</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Summa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Yo'nalish</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Kim tomonidan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment, idx) => (
                <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{payment.date}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">
                      {payment.clientName || <span className="text-muted-foreground">—</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">{payment.description}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs">
                      <span>{paymentTypeIcon(payment.type)}</span>
                      {getStatusLabel(payment.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${payment.direction === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {payment.direction === 'income' ? '+' : '-'}{formatCurrency(payment.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.direction)}`}>
                      {getStatusLabel(payment.direction)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{payment.createdBy}</td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
                      <Printer size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                    To'lovlar topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="text-xs text-muted-foreground">{filtered.length} ta to'lov</div>
          <div className="flex gap-4 text-xs">
            <span className="text-green-600 font-medium">
              Kirim: {formatCurrency(filtered.filter(p => p.direction === 'income').reduce((s, p) => s + p.amount, 0))}
            </span>
            <span className="text-red-600 font-medium">
              Chiqim: {formatCurrency(filtered.filter(p => p.direction === 'outcome').reduce((s, p) => s + p.amount, 0))}
            </span>
          </div>
        </div>
      </div>

      {showModal && <PaymentModal onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}
