import { useState } from 'react';
import { Plus, Edit, Trash2, Search, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { mockServices, formatCurrency } from '../mockData';
import { Service } from '../types';

function ServiceModal({ service, onClose, onSave }: {
  service: Partial<Service> | null;
  onClose: () => void;
  onSave: (s: Partial<Service>) => void;
}) {
  const [form, setForm] = useState<Partial<Service>>(service || {
    name: '', category: 'Umumiy', price: 0, duration: 30, active: true
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">{service?.id ? 'Xizmatni tahrirlash' : 'Yangi xizmat'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Xizmat nomi *</label>
            <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Xizmat nomi" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Kategoriya</label>
              <select value={form.category || 'Umumiy'} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Umumiy</option>
                <option>Laboratoriya</option>
                <option>Diagnostika</option>
                <option>Davolash</option>
                <option>Oftalm</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Davomiyligi (daqiqa)</label>
              <input type="number" value={form.duration || 30} onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Narxi (so'm) *</label>
            <input type="number" value={form.price || ''} onChange={e => setForm({ ...form, price: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Faollik:</label>
            <button onClick={() => setForm({ ...form, active: !form.active })}
              className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors ${form.active ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="text-sm text-muted-foreground">{form.active ? 'Faol' : 'Nofaol'}</span>
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

const categoryColors: Record<string, string> = {
  'Umumiy': 'bg-blue-100 text-blue-700',
  'Laboratoriya': 'bg-purple-100 text-purple-700',
  'Diagnostika': 'bg-green-100 text-green-700',
  'Davolash': 'bg-amber-100 text-amber-700',
  'Oftalm': 'bg-pink-100 text-pink-700',
};

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState<Partial<Service> | null>(null);

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (form: Partial<Service>) => {
    if (form.id) {
      setServices(prev => prev.map(s => s.id === form.id ? { ...s, ...form } as Service : s));
    } else {
      setServices(prev => [...prev, { ...form as Service, id: 's' + Date.now() }]);
    }
    setShowModal(false);
    setEditService(null);
  };

  const toggleActive = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleDelete = (id: string) => {
    if (confirm('Xizmatni o\'chirishni tasdiqlaysizmi?')) {
      setServices(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Xizmat yoki kategoriya bo'yicha qidirish..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button
          onClick={() => { setEditService(null); setShowModal(true); }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium">
          <Plus size={16} />
          <span>Yangi xizmat</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Jami xizmatlar', value: services.length },
          { label: 'Faol', value: services.filter(s => s.active).length },
          { label: "O'rtacha narx", value: formatCurrency(Math.round(services.reduce((s, x) => s + x.price, 0) / services.length)) },
          { label: 'Kategoriyalar', value: [...new Set(services.map(s => s.category))].length },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-border text-center">
            <div className="text-xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Xizmat nomi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Kategoriya</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Davomiyligi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Narxi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Holat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((service, idx) => (
                <tr key={service.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{service.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[service.category] || 'bg-gray-100 text-gray-700'}`}>
                      {service.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{service.duration} daq</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(service.price)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(service.id)} className="flex items-center gap-1.5 text-xs">
                      {service.active
                        ? <ToggleRight size={18} className="text-green-600" />
                        : <ToggleLeft size={18} className="text-gray-400" />}
                      <span className={service.active ? 'text-green-600' : 'text-muted-foreground'}>
                        {service.active ? 'Faol' : 'Nofaol'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditService(service); setShowModal(true); }}
                        className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => handleDelete(service.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors">
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

      {showModal && (
        <ServiceModal
          service={editService}
          onClose={() => { setShowModal(false); setEditService(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
