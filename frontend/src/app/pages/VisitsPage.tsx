import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Calendar, List, X, Edit, Eye, Clock, Loader2, ChevronLeft, ChevronRight, CreditCard, CheckCircle, AlertCircle, Stethoscope, Home, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { visitsApi, Visit, CreateVisitDto, UpdateVisitStatusDto } from '../api/visits.service';
import { clientsApi, Client } from '../api/clients.service';
import { roomsApi } from '../api/rooms.service';
import { usersService, FrontendUser } from '../api/users.service';
import { api } from '../api/client';

export interface Service {
  id: number;
  name: string;
  price: number;
  duration_min: number;
  department?: { id: number; name: string };
}

export interface Room {
  id: number;
  name: string;
  room_number: string | null;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLOSED';
}

const statusOptions = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'DONE', 'CANCELLED', 'NO_SHOW'] as const;

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    DONE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    NO_SHOW: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    SCHEDULED: 'Kutilmoqda',
    IN_PROGRESS: 'Jarayonda',
    COMPLETED: 'Yakunlangan',
    DONE: 'Bajarilgan',
    CANCELLED: 'Bekor qilingan',
    NO_SHOW: 'Kelmadi',
  };
  return labels[status] || status;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
};

function VisitModal({ visit, clients, onClose, onSave, isLoading }: {
  visit: Partial<Visit> | null;
  clients: Client[];
  onClose: () => void;
  onSave: (v: CreateVisitDto, status?: string) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    client_id: visit?.client?.id || 0,
    doctor_id: visit?.doctor?.id || undefined as number | undefined,
    room_id: undefined as number | undefined,
    service_ids: [] as number[],
    visit_date: visit?.visit_date?.split('T')[0] || new Date().toISOString().split('T')[0],
    visit_time: visit?.visit_date ? visit.visit_date.split('T')[1]?.slice(0, 5) : '',
    description: visit?.description || '',
    status: visit?.status || 'SCHEDULED' as const,
  });
  const [services, setServices] = useState<Service[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [doctors, setDoctors] = useState<FrontendUser[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesRes = await api.get<any>('/services?limit=100', true);
        const servicesData = servicesRes?.data || servicesRes?.data?.data || [];
        const list = Array.isArray(servicesData) ? servicesData : [];
        setServices(list);
      } catch (err) {
        console.error('Services error:', err);
        setServices([]);
      }

      try {
        const roomsRes = await roomsApi.findAvailable(undefined, 50);
        const roomsData = roomsRes?.data || roomsRes?.data?.data || [];
        setRooms(Array.isArray(roomsData) ? roomsData : []);
      } catch (err) {
        console.error('Rooms error:', err);
        setRooms([]);
      }

      try {
        const usersRes = await usersService.getAll({ limit: 100, status: 'ACTIVE' });
        setDoctors(usersRes.users || []);
      } catch (err) {
        console.error('Users error:', err);
        setDoctors([]);
      }
    };
    fetchData();
  }, []);

  const [showClientSearch, setShowClientSearch] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  useEffect(() => {
    if (clientSearch.length >= 2) {
      const localFiltered = clients.filter(c => 
        c.full_name?.toLowerCase().includes(clientSearch.toLowerCase())
      );
      clientsApi.search({ full_name: clientSearch, limit: 10 }).then(res => {
        console.log('Search API response:', res);
        const apiClients = res.data?.data || res.data || [];
        console.log('API clients:', apiClients);
        const merged = [...localFiltered, ...apiClients.filter((c: Client) => !localFiltered.some(l => l.id === c.id))];
        console.log('Merged clients:', merged);
        setFilteredClients(merged);
        setShowClientSearch(true);
      }).catch(err => {
        console.error('Search error:', err);
        setFilteredClients(localFiltered);
        setShowClientSearch(true);
      });
    } else {
      setFilteredClients([]);
    }
  }, [clientSearch, clients]);

  const selectedClient = clients.find(c => c.id === form.client_id);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">
            {visit?.id ? 'Tashrifni tahrirlash' : 'Yangi tashrif'}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-3">
<div>
              <label htmlFor="client-input" className="text-sm font-medium mb-1 block">Bemor *</label>
              <div className="relative">
                <input
                  id="client-input"
                  type="text"
                  value={selectedClient?.full_name ?? clientSearch}
                  onChange={e => {
                    setClientSearch(e.target.value);
                    setForm({ ...form, client_id: 0 });
                  }}
                  onFocus={() => clientSearch.length >= 2 && setShowClientSearch(true)}
                  onKeyDown={(e) => {
                    }}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bemor ismini yozing..."
                />
                {showClientSearch && filteredClients.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredClients.map(client => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, client_id: client.id });
                          setClientSearch(client.full_name ?? '');
                          setShowClientSearch(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                      >
                        <div className="font-medium">{client.full_name ?? '—'}</div>
                        <div className="text-xs text-muted-foreground">{client.phone ?? '—'}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
<div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="date-input" className="text-sm font-medium mb-1 block">Sana *</label>
                <input
                  id="date-input"
                  type="date"
                  value={form.visit_date}
                  onChange={e => setForm({ ...form, visit_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="time-input" className="text-sm font-medium mb-1 block">Vaqt</label>
                <input
                  id="time-input"
                  type="time"
                  value={form.visit_time || ''}
                  onChange={e => setForm({ ...form, visit_time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="status-select" className="text-sm font-medium mb-1 block">Holat</label>
              <select
                id="status-select"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map(s => (
                  <option key={s} value={s}>{getStatusLabel(s)}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="doctor-select" className="text-sm font-medium mb-1 block">Shifokor</label>
              <select
                id="doctor-select"
                value={form.doctor_id || ''}
                onChange={e => setForm({ ...form, doctor_id: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tanlanmagan</option>
                {doctors.filter(d => d.role && (d.role.name === 'Doctor' || d.role.name === 'Nurse')).map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.fullName || doc.login || 'N/A'}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="room-select" className="text-sm font-medium mb-1 block">Xona</label>
              <select
                id="room-select"
                value={form.room_id || ''}
                onChange={e => setForm({ ...form, room_id: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tanlanmagan</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name} ({room.room_number})</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor="services-select" className="text-sm font-medium mb-1 block">Xizmatlar</label>
              <select
                id="services-select"
                value={form.service_ids[0] || ''}
                onChange={e => {
                  setForm({ ...form, service_ids: e.target.value ? [Number(e.target.value)] : [] });
                }}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tanlanmagan</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({formatCurrency(service.price)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="description-textarea" className="text-sm font-medium mb-1 block">Izoh</label>
              <textarea
                id="description-textarea"
                value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Qo'shimcha ma'lumot..."
              />
            </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={() => {
              if (!form.doctor_id) {
                toast.error('Iltimos, shifokor tanlang');
                return;
              }
              const dateTime = form.visit_time 
                ? `${form.visit_date}T${form.visit_time}:00.000Z`
                : form.visit_date;
              onSave({
                client_id: form.client_id,
                doctor_id: form.doctor_id,
                room_id: form.room_id,
                service_ids: form.service_ids.length > 0 ? form.service_ids : undefined,
                visit_date: dateTime,
                description: form.description || undefined,
                status: form.status as 'SCHEDULED' | 'IN_PROGRESS',
              }, visit?.id ? 'update' : 'create');
            }}
            disabled={!form.client_id || !form.doctor_id || isLoading}
            style={{ backgroundColor: (!form.client_id || !form.doctor_id || isLoading) ? '#ccc' : '' }}
            onMouseDown={() => {}}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientSearchModal({ onClose, onSelect, isLoading }: {
  onClose: () => void;
  onSelect: (client: Client) => void;
  isLoading: boolean;
}) {
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    if (search.length >= 2) {
      clientsApi.search({ full_name: search, limit: 20 }).then(res => {
        setClients(res.data);
      }).catch(() => setClients([]));
    }
  }, [search]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Bemor tanlash</h2>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Bemor ismini yozing..."
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        <div className="max-h-64 overflow-y-auto px-4 pb-4">
          {clients.map(client => (
            <button
              key={client.id}
              type="button"
              onClick={() => onSelect(client)}
              disabled={isLoading}
              className="w-full px-3 py-2 text-left hover:bg-muted rounded-lg mb-1 disabled:opacity-50"
            >
              <div className="font-medium">{client.full_name ?? '—'}</div>
              <div className="text-xs text-muted-foreground">{client.phone ?? '—'}</div>
            </button>
          ))}
          {clients.length === 0 && search.length >= 2 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Bemor topilmadi
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── To'lov modal ────────────────────────────────────────────────────────────
function PayInModal({
  visit,
  onClose,
  onPaid,
}: {
  visit: Visit;
  onClose: () => void;
  onPaid: () => void;
}) {
  const debt = Number(visit.debt_amount ?? 0);
  const [amount, setAmount] = useState(String(debt));
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePay = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { toast.error('Summa kiritilmadi'); return; }
    if (amt > debt) { toast.error(`Summa qarzdan oshmasligi kerak: ${debt.toLocaleString('uz-UZ')} so'm`); return; }
    try {
      setSaving(true);
      await visitsApi.createPayment(visit.id, { amount: amt, description: description || undefined });
      toast.success(`${amt.toLocaleString('uz-UZ')} so'm qabul qilindi`);
      onPaid();
    } catch (err: any) {
      toast.error(err?.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <p className="font-semibold">To'lov qabul qilish</p>
            <p className="text-xs text-muted-foreground mt-0.5">{visit.client?.full_name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-muted/40 rounded-xl p-2">
              <div className="font-semibold text-foreground">{Number(visit.total_amount).toLocaleString('uz-UZ')}</div>
              <div className="text-muted-foreground">Jami</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2">
              <div className="font-semibold text-green-600">{Number(visit.paid_amount).toLocaleString('uz-UZ')}</div>
              <div className="text-muted-foreground">To'langan</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-2">
              <div className="font-semibold text-red-600">{debt.toLocaleString('uz-UZ')}</div>
              <div className="text-muted-foreground">Qarz</div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Summa (so'm) *</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              max={debt}
              min={1}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              {[0.5, 1].map(ratio => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAmount(String(Math.round(debt * ratio)))}
                  className="px-2.5 py-1 text-xs border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  {ratio === 1 ? 'To\'liq' : '50%'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Izoh</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Naqd / Karta / O'tkazma..."
            />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-border">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors disabled:opacity-50"
          >
            Bekor
          </button>
          <button
            onClick={handlePay}
            disabled={saving || !amount || Number(amount) <= 0}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
            Qabul qilish
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Visit detail panel ───────────────────────────────────────────────────────
function VisitDetailPanel({
  visitId,
  onClose,
  onUpdated,
}: {
  visitId: number;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await visitsApi.findOne(visitId);
      if (res.success) setVisit(res.data);
    } catch {
      toast.error('Tashrif ma\'lumotlarini yuklab bo\'lmadi');
    } finally {
      setLoading(false);
    }
  }, [visitId]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (newStatus: string) => {
    if (!visit) return;
    try {
      setStatusLoading(true);
      await visitsApi.updateStatus(visit.id, { status: newStatus as any });
      toast.success(`Holat: ${getStatusLabel(newStatus)}`);
      await load();
      onUpdated();
    } catch (err: any) {
      toast.error(err?.message || 'Xatolik');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!visit) return;
    try {
      setStatusLoading(true);
      await visitsApi.complete(visit.id);
      toast.success('Tashrif yakunlandi');
      await load();
      onUpdated();
    } catch (err: any) {
      toast.error(err?.message || 'Xatolik');
    } finally {
      setStatusLoading(false);
    }
  };

  const debt = visit ? Number(visit.debt_amount ?? 0) : 0;
  const paid = visit ? Number(visit.paid_amount ?? 0) : 0;
  const total = visit ? Number(visit.total_amount ?? 0) : 0;
  const paidPct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  const nextStatuses: Record<string, string[]> = {
    SCHEDULED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
    IN_PROGRESS: ['CANCELLED'],
    COMPLETED: [],
    DONE: [],
    CANCELLED: [],
    NO_SHOW: [],
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <p className="font-semibold text-base">Tashrif tafsilotlari</p>
            {visit && <p className="text-xs text-muted-foreground mt-0.5">#{visit.id}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : !visit ? (
            <div className="text-center py-10 text-muted-foreground text-sm">Ma'lumot topilmadi</div>
          ) : (
            <>
              {/* Mijoz va shifokor */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 font-semibold text-sm">
                    {visit.client?.full_name?.charAt(0) ?? '?'}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{visit.client?.full_name ?? '—'}</div>
                    <div className="text-xs text-muted-foreground">{visit.client?.phone ?? '—'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground mb-0.5">Shifokor</div>
                    <div className="font-medium flex items-center gap-1"><Stethoscope size={11} />{visit.doctor?.full_name ?? '—'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-0.5">Sana</div>
                    <div className="font-medium flex items-center gap-1">
                      <Clock size={11} />
                      {visit.visit_date ? new Date(visit.visit_date).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Holat</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                    {getStatusLabel(visit.status)}
                  </span>
                </div>
              </div>

              {/* Holat o'zgartirish */}
              {(nextStatuses[visit.status]?.length > 0 || visit.status === 'IN_PROGRESS') && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Holat o'zgartirish</p>
                  <div className="flex flex-wrap gap-2">
                    {visit.status === 'IN_PROGRESS' && (
                      <button
                        onClick={handleComplete}
                        disabled={statusLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle size={12} />
                        Yakunlash
                      </button>
                    )}
                    {nextStatuses[visit.status]?.map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        disabled={statusLoading}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${getStatusColor(s)}`}
                      >
                        {getStatusLabel(s)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Xizmatlar */}
              {(visit.visit_services?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Xizmatlar</p>
                  <div className="space-y-1.5">
                    {visit.visit_services!.map(s => (
                      <div key={s.id} className="flex items-center justify-between py-1.5 px-3 bg-muted/30 rounded-lg text-xs">
                        <span className="font-medium">{s.service?.name ?? '—'}</span>
                        <span className="text-muted-foreground">{Number(s.quantity) > 1 && `${s.quantity}x `}{Number(s.total).toLocaleString('uz-UZ')} so'm</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Xonalar */}
              {(visit.visit_rooms?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Xonalar</p>
                  {visit.visit_rooms!.map(r => (
                    <div key={r.id} className="flex items-center gap-2 py-1.5 px-3 bg-muted/30 rounded-lg text-xs">
                      <Home size={11} />
                      <span className="font-medium">{r.room?.name ?? '—'}</span>
                      <span className="text-muted-foreground ml-auto">{r.room?.room_number}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Moliyaviy holat */}
              <div className="border border-border rounded-xl p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><DollarSign size={13} />Moliyaviy holat</p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="text-base font-bold text-foreground">{total.toLocaleString('uz-UZ')}</div>
                    <div className="text-muted-foreground">Jami</div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-green-600">{paid.toLocaleString('uz-UZ')}</div>
                    <div className="text-muted-foreground">To'langan</div>
                  </div>
                  <div>
                    <div className={`text-base font-bold ${debt > 0 ? 'text-red-600' : 'text-green-600'}`}>{debt.toLocaleString('uz-UZ')}</div>
                    <div className="text-muted-foreground">{debt > 0 ? 'Qarz' : 'Qarz yo\'q'}</div>
                  </div>
                </div>
                {total > 0 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">To'lov holati</span>
                      <span className="font-medium">{paidPct}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${paidPct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* To'lovlar tarixi */}
              {(visit.payments?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">To'lovlar tarixi</p>
                  <div className="space-y-1.5">
                    {visit.payments!.map(p => (
                      <div key={p.id} className="flex items-center justify-between py-1.5 px-3 bg-muted/30 rounded-lg text-xs">
                        <div>
                          <div className="font-medium">{Number(p.amount).toLocaleString('uz-UZ')} so'm</div>
                          {p.description && <div className="text-muted-foreground">{p.description}</div>}
                        </div>
                        <div className="text-muted-foreground text-right">
                          {new Date(p.payment_date).toLocaleDateString('uz-UZ')}
                          <div>{new Date(p.payment_date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Qarz alert */}
              {debt > 0 && (
                <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" />
                  <span>Mijozda <strong>{debt.toLocaleString('uz-UZ')} so'm</strong> qarz mavjud.</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer — to'lov tugmasi */}
        {visit && debt > 0 && ['COMPLETED', 'IN_PROGRESS', 'DONE'].includes(visit.status) && (
          <div className="shrink-0 p-4 border-t border-border">
            <button
              onClick={() => setShowPayModal(true)}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <CreditCard size={16} />
              To'lov qabul qilish — {debt.toLocaleString('uz-UZ')} so'm
            </button>
          </div>
        )}
      </div>

      {/* To'lov modal */}
      {showPayModal && visit && (
        <PayInModal
          visit={visit}
          onClose={() => setShowPayModal(false)}
          onPaid={() => {
            setShowPayModal(false);
            load();
            onUpdated();
          }}
        />
      )}
    </>
  );
}

export function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editVisit, setEditVisit] = useState<Partial<Visit> | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailVisitId, setDetailVisitId] = useState<number | null>(null);

  const fetchVisits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await visitsApi.findMany({
        page,
        limit: 20,
        date_from: statusFilter !== 'all' ? undefined : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (res && res.success !== false && Array.isArray(res.data)) {
        setVisits(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotal(res.pagination.total);
        }
      } else if (Array.isArray(res)) {
        setVisits(res);
      } else {
        setError((res as any)?.message || 'Xatolik yuz berdi');
        setVisits([]);
      }
    } catch (err: any) {
      setError(err.message || 'Xatolik yuz berdi');
      setVisits([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  const fetchClients = useCallback(async () => {
    try {
      const res = await clientsApi.findMany({ limit: 100 });
      setClients(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
    fetchClients();
  }, [fetchVisits, fetchClients]);

const handleSave = async (dto: CreateVisitDto, action?: string) => {
    try {
      setActionLoading(true);
      if (editVisit?.id && action === 'update') {
        await visitsApi.update(editVisit.id, {
          doctor_id: dto.doctor_id,
          visit_date: dto.visit_date,
          description: dto.description,
        });
        toast.success('Tashrif muvaffaqiyatli yangilandi');
      } else {
        await visitsApi.create(dto);
        toast.success('Tashrif muvaffaqiyatli yaratildi');
      }
      setShowModal(false);
      setEditVisit(null);
      fetchVisits();
    } catch (err: any) {
      toast.error(err.message || 'Xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (visitId: number, newStatus: string) => {
    try {
      setActionLoading(true);
      const dto: UpdateVisitStatusDto = { status: newStatus as any };
      await visitsApi.updateStatus(visitId, dto);
      toast.success(`Tashrif holati "${newStatus}" ga o'zgartirildi`);
      fetchVisits();
    } catch (err: any) {
      toast.error(err.message || 'Xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = visits.filter(v => {
    const clientMatch = !search || 
      v.client?.full_name?.toLowerCase()?.includes(search.toLowerCase());
    const doctorMatch = !search || 
      v.doctor?.full_name?.toLowerCase()?.includes(search.toLowerCase());
    return clientMatch || doctorMatch;
  });

  const statusCounts = statusOptions.reduce((acc, s) => {
    acc[s] = visits.filter(v => v.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Bemor yoki shifokor bo'yicha qidirish..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex border border-border rounded-xl overflow-hidden bg-white dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <Calendar size={16} />
            </button>
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Barcha holat</option>
            {statusOptions.map(s => (
              <option key={s} value={s}>{getStatusLabel(s)}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => { setEditVisit(null); setShowModal(true); }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Yangi tashrif</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusOptions.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors border ${
              statusFilter === s ? 'border-transparent ' + getStatusColor(s) : 'border-border bg-white dark:bg-slate-800 text-muted-foreground hover:bg-muted'
            }`}
          >
            <span className="font-medium">{statusCounts[s]}</span>
            <span>{getStatusLabel(s)}</span>
          </button>
        ))}
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{new Date().toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })}</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                disabled={page === 1}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                disabled={page >= totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - date.getDay() + i);
              const dateStr = date.toISOString().split('T')[0];
              const dayVisits = visits.filter(v => v.visit_date?.startsWith(dateStr));
              return (
                <div
                  key={i}
                  className={`border border-border rounded-xl p-2 min-h-[80px] ${
                    dateStr === new Date().toISOString().split('T')[0]
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300'
                      : 'bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className={`text-xs font-semibold mb-1 ${
                    dateStr === new Date().toISOString().split('T')[0]
                      ? 'text-blue-600'
                      : 'text-muted-foreground'
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayVisits.slice(0, 2).map(v => (
                      <div
                        key={v.id}
                        className={`text-xs px-1 py-0.5 rounded ${getStatusColor(v.status)} truncate`}
                      >
                        {v.client?.full_name?.split(' ')[0]}
                      </div>
                    ))}
                    {dayVisits.length > 2 && (
                      <div className="text-xs text-muted-foreground">+{dayVisits.length - 2} ta</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                type="button"
                onClick={fetchVisits}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm"
              >
                Qayta urinish
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Bemor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Shifokor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Sana</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Xizmatlar</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Summa</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Holat</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(visit => (
                      <tr
                        key={visit.id}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 text-xs font-semibold">
                              {visit.client?.full_name?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {visit.client?.full_name || '—'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {visit.client?.phone || '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {visit.doctor?.full_name || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-foreground text-xs">
                            {visit.visit_date ? new Date(visit.visit_date).toLocaleDateString('uz-UZ') : '—'}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5">
                            <Clock size={11} />
                            {visit.visit_date ? new Date(visit.visit_date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {visit.visit_services && visit.visit_services.length > 0 && visit.visit_services.slice(0, 1).map(s => (
                              <span
                                key={s.id}
                                className="px-1.5 py-0.5 bg-muted rounded text-xs"
                              >
                                {s.service?.name || '—'}
                              </span>
                            ))}
                            {(visit.visit_services?.length || 0) > 1 && (
                              <span className="px-1.5 py-0.5 bg-muted rounded text-xs">
                                +{(visit.visit_services?.length || 0) - 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-foreground text-xs font-medium">
                            {formatCurrency(visit.total_amount ?? 0)}
                          </div>
                          {(visit.debt_amount ?? 0) > 0 && (
                            <div className="text-red-500 text-xs">
                              Qarz: {formatCurrency(visit.debt_amount ?? 0)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={visit.status}
                            onChange={e => handleStatusChange(visit.id, e.target.value)}
                            disabled={actionLoading}
                            className={`px-2 py-1 rounded-lg text-xs border-0 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${getStatusColor(visit.status)}`}
                          >
                            {statusOptions.map(s => (
                              <option key={s} value={s}>{getStatusLabel(s)}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setDetailVisitId(visit.id)}
                              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-600 transition-colors"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
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
                        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                          Tashriflar topilmadi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    {total} tashrifdan {(page - 1) * 20 + 1}-{(page) * 20 > total ? total : (page) * 20}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="px-3 py-1.5 text-sm">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {showModal && (
        <VisitModal
          visit={editVisit}
          clients={clients}
          onClose={() => { setShowModal(false); setEditVisit(null); }}
          onSave={handleSave}
          isLoading={actionLoading}
        />
      )}

      {detailVisitId && (
        <VisitDetailPanel
          visitId={detailVisitId}
          onClose={() => setDetailVisitId(null)}
          onUpdated={fetchVisits}
        />
      )}
    </div>
  );
}