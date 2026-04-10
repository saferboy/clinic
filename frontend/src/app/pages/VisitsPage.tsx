import { useState } from 'react';
import { Plus, Search, Calendar, List, Filter, X, Edit, Eye, Clock } from 'lucide-react';
import { mockVisits, getStatusColor, getStatusLabel, formatCurrency } from '../mockData';
import { Visit, VisitStatus } from '../types';

const statusOptions: VisitStatus[] = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];

function VisitModal({ visit, onClose, onSave }: {
  visit: Partial<Visit> | null;
  onClose: () => void;
  onSave: (v: Partial<Visit>) => void;
}) {
  const [form, setForm] = useState<Partial<Visit>>(visit || {
    clientName: '', doctorName: 'Dr. Nilufar Karimova', roomName: '1-xona',
    date: '2026-04-04', time: '09:00', duration: 30, status: 'scheduled', notes: '', totalAmount: 0, paidAmount: 0, services: []
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">{visit?.id ? 'Tashrifni tahrirlash' : 'Yangi tashrif'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Bemor *</label>
              <input value={form.clientName || ''} onChange={e => setForm({ ...form, clientName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Bemor ismi" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Shifokor</label>
              <select value={form.doctorName || ''} onChange={e => setForm({ ...form, doctorName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Dr. Nilufar Karimova</option>
                <option>Dr. Jasur Rahimov</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Xona</label>
              <select value={form.roomName || ''} onChange={e => setForm({ ...form, roomName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>1-xona</option>
                <option>2-xona</option>
                <option>3-xona</option>
                <option>4-xona</option>
                <option>6-xona</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Sana *</label>
              <input type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Vaqt *</label>
              <input type="time" value={form.time || ''} onChange={e => setForm({ ...form, time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Davomiyligi (daqiqa)</label>
              <input type="number" value={form.duration || 30} onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Holat</label>
              <select value={form.status || 'scheduled'} onChange={e => setForm({ ...form, status: e.target.value as VisitStatus })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {statusOptions.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Summa (so'm)</label>
              <input type="number" value={form.totalAmount || 0} onChange={e => setForm({ ...form, totalAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">To'langan (so'm)</label>
              <input type="number" value={form.paidAmount || 0} onChange={e => setForm({ ...form, paidAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Izoh</label>
              <textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={3} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Qo'shimcha ma'lumot..." />
            </div>
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

// Simple calendar day cell
function CalendarDayCell({ date, visits }: { date: string; visits: Visit[] }) {
  const day = new Date(date).getDate();
  const isToday = date === '2026-04-03';
  return (
    <div className={`border border-border rounded-xl p-2 min-h-[80px] ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' : 'bg-white dark:bg-slate-800'}`}>
      <div className={`text-xs font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-muted-foreground'}`}>{day}</div>
      <div className="space-y-0.5">
        {visits.slice(0, 2).map(v => (
          <div key={v.id} className={`text-xs px-1 py-0.5 rounded ${getStatusColor(v.status)} truncate`}>
            {v.time} {v.clientName.split(' ')[0]}
          </div>
        ))}
        {visits.length > 2 && <div className="text-xs text-muted-foreground">+{visits.length - 2} ta</div>}
      </div>
    </div>
  );
}

export function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>(mockVisits);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editVisit, setEditVisit] = useState<Partial<Visit> | null>(null);

  const filtered = visits.filter(v => {
    const matchSearch = v.clientName.toLowerCase().includes(search.toLowerCase()) ||
      v.doctorName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchDoctor = doctorFilter === 'all' || v.doctorName === doctorFilter;
    return matchSearch && matchStatus && matchDoctor;
  });

  const handleSave = (form: Partial<Visit>) => {
    if (form.id) {
      setVisits(prev => prev.map(v => v.id === form.id ? { ...v, ...form } as Visit : v));
    } else {
      const newVisit: Visit = {
        ...form as Visit,
        id: 'v' + Date.now(),
        clientId: 'c0', doctorId: '2', roomId: 'r1',
        services: [], createdAt: new Date().toISOString().split('T')[0],
      };
      setVisits(prev => [newVisit, ...prev]);
    }
    setShowModal(false);
    setEditVisit(null);
  };

  // Calendar view for April 2026 (week view - first week of April)
  const aprilDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2026, 3, 1 + i);
    return date.toISOString().split('T')[0];
  });

  const statusCounts = statusOptions.reduce((acc, s) => {
    acc[s] = visits.filter(v => v.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Bemor yoki shifokor bo'yicha qidirish..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-2">
          {/* View toggle */}
          <div className="flex border border-border rounded-xl overflow-hidden bg-white dark:bg-slate-800">
            <button onClick={() => setViewMode('list')}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:bg-muted'}`}>
              <List size={16} />
            </button>
            <button onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:bg-muted'}`}>
              <Calendar size={16} />
            </button>
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Barcha holat</option>
            {statusOptions.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
          </select>
          <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Barcha shifokorlar</option>
            <option>Dr. Nilufar Karimova</option>
            <option>Dr. Jasur Rahimov</option>
          </select>
          <button
            onClick={() => { setEditVisit(null); setShowModal(true); }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Yangi tashrif</span>
          </button>
        </div>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map(s => (
          <button key={s}
            onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors border ${
              statusFilter === s ? 'border-transparent ' + getStatusColor(s) : 'border-border bg-white dark:bg-slate-800 text-muted-foreground hover:bg-muted'
            }`}>
            <span className="font-medium">{statusCounts[s]}</span>
            <span>{getStatusLabel(s)}</span>
          </button>
        ))}
      </div>

      {viewMode === 'calendar' ? (
        /* Calendar View */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Aprel 2026 — 1-7 kun</h3>
            <div className="flex gap-2">
              <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">←</button>
              <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">→</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {aprilDays.map(date => (
              <CalendarDayCell
                key={date}
                date={date}
                visits={visits.filter(v => v.date === date)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Bemor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Shifokor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Xona</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sana / Vaqt</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Xizmatlar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Summa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Holat</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(visit => (
                  <tr key={visit.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 text-xs font-semibold">
                          {visit.clientName.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground">{visit.clientName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{visit.doctorName}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{visit.roomName}</td>
                    <td className="px-4 py-3">
                      <div className="text-foreground text-xs">{visit.date}</div>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                        <Clock size={11} />
                        {visit.time} · {visit.duration} daq
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {visit.services.slice(0, 1).map(s => (
                          <span key={s.id} className="px-1.5 py-0.5 bg-muted rounded text-xs">{s.name}</span>
                        ))}
                        {visit.services.length > 1 && (
                          <span className="px-1.5 py-0.5 bg-muted rounded text-xs">+{visit.services.length - 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-foreground text-xs font-medium">{formatCurrency(visit.totalAmount)}</div>
                      {visit.paidAmount < visit.totalAmount && (
                        <div className="text-red-500 text-xs">Qarz: {formatCurrency(visit.totalAmount - visit.paidAmount)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={visit.status}
                        onChange={e => {
                          const newStatus = e.target.value as VisitStatus;
                          setVisits(prev => prev.map(v => v.id === visit.id ? { ...v, status: newStatus } : v));
                        }}
                        className={`px-2 py-1 rounded-lg text-xs border-0 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(visit.status)}`}
                      >
                        {statusOptions.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-600 transition-colors">
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => { setEditVisit(visit); setShowModal(true); }}
                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                      Tashriflar topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <VisitModal
          visit={editVisit}
          onClose={() => { setShowModal(false); setEditVisit(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
