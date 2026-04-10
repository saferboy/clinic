import { useState } from 'react';
import {
  Search, Plus, Filter, Download, Phone, Eye, Edit, Trash2, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { mockClients, formatCurrency, getStatusColor, getStatusLabel } from '../mockData';
import { Client } from '../types';

function ClientModal({ client, onClose, onSave }: {
  client: Partial<Client> | null;
  onClose: () => void;
  onSave: (c: Partial<Client>) => void;
}) {
  const [form, setForm] = useState<Partial<Client>>(client || {
    name: '', phone: '', email: '', birthDate: '', gender: 'male',
    address: '', group: 'Oddiy', source: 'Reklama', status: 'active'
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">{client?.id ? 'Mijozni tahrirlash' : 'Yangi mijoz'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">To'liq ism *</label>
              <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ism familiya" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Telefon *</label>
              <input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+998901234567" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@mail.uz" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tug'ilgan sana</label>
              <input type="date" value={form.birthDate || ''} onChange={e => setForm({ ...form, birthDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Jins</label>
              <select value={form.gender || 'male'} onChange={e => setForm({ ...form, gender: e.target.value as 'male' | 'female' })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="male">Erkak</option>
                <option value="female">Ayol</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Manzil</label>
              <input value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Shahar, tuman" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Guruh</label>
              <select value={form.group || 'Oddiy'} onChange={e => setForm({ ...form, group: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Oddiy</option>
                <option>VIP</option>
                <option>Korporativ</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Manba</label>
              <select value={form.source || 'Reklama'} onChange={e => setForm({ ...form, source: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Reklama</option>
                <option>Do'st tavsiyasi</option>
                <option>Internet</option>
                <option>Instagram</option>
                <option>Shifokor tavsiyasi</option>
              </select>
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

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState<Partial<Client> | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const perPage = 8;

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchGroup = groupFilter === 'all' || c.group === groupFilter;
    return matchSearch && matchStatus && matchGroup;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSave = (form: Partial<Client>) => {
    if (form.id) {
      setClients(prev => prev.map(c => c.id === form.id ? { ...c, ...form } as Client : c));
    } else {
      const newClient: Client = {
        ...form as Client,
        id: 'c' + Date.now(),
        balance: 0,
        totalVisits: 0,
        lastVisit: '',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setClients(prev => [newClient, ...prev]);
    }
    setShowModal(false);
    setEditClient(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Mijozni o\'chirishni tasdiqlaysizmi?')) {
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Ism yoki telefon bo'yicha qidirish..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Barcha holat</option>
            <option value="active">Faol</option>
            <option value="inactive">Nofaol</option>
          </select>
          <select value={groupFilter} onChange={e => { setGroupFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Barcha guruh</option>
            <option value="Oddiy">Oddiy</option>
            <option value="VIP">VIP</option>
            <option value="Korporativ">Korporativ</option>
          </select>
          <button className="px-4 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm hover:bg-muted transition-colors flex items-center gap-2">
            <Download size={16} />
            <span className="hidden sm:inline">Eksport</span>
          </button>
          <button
            onClick={() => { setEditClient(null); setShowModal(true); }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Yangi mijoz</span>
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <span className="text-sm text-blue-700 dark:text-blue-400">{selected.length} ta tanlandi</span>
          <button className="text-xs text-red-600 hover:underline">O'chirish</button>
          <button className="text-xs text-blue-600 hover:underline">Eksport</button>
          <button onClick={() => setSelected([])} className="ml-auto text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Jami', value: clients.length, color: 'text-foreground' },
          { label: 'Faol', value: clients.filter(c => c.status === 'active').length, color: 'text-green-600' },
          { label: 'VIP', value: clients.filter(c => c.group === 'VIP').length, color: 'text-amber-600' },
          { label: 'Qarzkor', value: clients.filter(c => c.balance < 0).length, color: 'text-red-600' },
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
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tashriflar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Balans</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">So'nggi tashrif</th>
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
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{client.name}</div>
                        <div className="text-xs text-muted-foreground">{client.gender === 'male' ? 'Erkak' : 'Ayol'} · {client.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{client.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      client.group === 'VIP' ? 'bg-amber-100 text-amber-700' :
                      client.group === 'Korporativ' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{client.group}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-foreground font-medium">{client.totalVisits}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium text-sm ${client.balance < 0 ? 'text-red-600' : client.balance > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {client.balance < 0 ? '-' : ''}{formatCurrency(Math.abs(client.balance))}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{client.lastVisit || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                      {getStatusLabel(client.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button title="Qo'ng'iroq" className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg text-green-600 transition-colors">
                        <Phone size={15} />
                      </button>
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
                        onClick={() => handleDelete(client.id)}
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="text-xs text-muted-foreground">
            {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} / {filtered.length} ta
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-xs transition-colors ${p === page ? 'bg-blue-600 text-white' : 'hover:bg-muted text-foreground'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <ClientModal
          client={editClient}
          onClose={() => { setShowModal(false); setEditClient(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
