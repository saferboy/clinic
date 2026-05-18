import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, X, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  servicesApi, BackendService, CreateServiceDto, UpdateServicePriceDto, ServiceStatus,
} from '../api/services.service';
import { departmentsApi, Department } from '../api/departments.service';
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

const STATUS_LABELS: Record<ServiceStatus, string> = {
  ACTIVE: 'Faol',
  INACTIVE: 'Nofaol',
  ARCHIVED: 'Arxiv',
};

const STATUS_COLORS: Record<ServiceStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  ARCHIVED: 'bg-amber-100 text-amber-700',
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat('uz-UZ').format(v) + " so'm";
}

function ServiceModal({ service, departments, onClose, onSave }: {
  service: BackendService | null;
  departments: Department[];
  onClose: () => void;
  onSave: (dto: CreateServiceDto) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: service?.name ?? '',
    price: service?.price !== undefined ? String(service.price) : '',
    department_id: service?.department_id != null ? String(service.department_id) : '',
    duration_min: String(service?.duration_min ?? 30),
    description: service?.description ?? '',
    status: (service?.status ?? 'ACTIVE') as ServiceStatus,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Xizmat nomi kiritilishi shart'); return; }
    if (!form.price || Number(form.price) < 0) { toast.error('Narx kiritilishi shart'); return; }
    setLoading(true);
    await onSave({
      name: form.name.trim(),
      price: Number(form.price),
      ...(form.department_id ? { department_id: Number(form.department_id) } : {}),
      duration_min: Number(form.duration_min) || 30,
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
      status: form.status,
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">{service ? 'Xizmatni tahrirlash' : 'Yangi xizmat'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Xizmat nomi *</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masalan: Terapevt ko'rigi"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Narxi (so'm) *</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min={0}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Davomiyligi (daqiqa)</label>
              <input
                type="number"
                value={form.duration_min}
                onChange={e => setForm({ ...form, duration_min: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={5}
                max={480}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Bo'lim</label>
              <select
                value={form.department_id}
                onChange={e => setForm({ ...form, department_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Tanlanmagan —</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Holat</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as ServiceStatus })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ACTIVE">Faol</option>
                <option value="INACTIVE">Nofaol</option>
                <option value="ARCHIVED">Arxiv</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Tavsif</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              placeholder="Ixtiyoriy tavsif..."
            />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors">
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium disabled:opacity-60"
          >
            {loading ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PriceModal({ service, onClose, onSave }: {
  service: BackendService;
  onClose: () => void;
  onSave: (dto: UpdateServicePriceDto) => Promise<void>;
}) {
  const [price, setPrice] = useState(String(service.price));
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!price || Number(price) < 0) { toast.error("Narx noto'g'ri kiritildi"); return; }
    setLoading(true);
    await onSave({ price: Number(price), reason: reason.trim() || undefined });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Narxni yangilash</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{service.name}</span>
            {' '}— hozirgi narx:{' '}
            <span className="font-semibold text-foreground">{formatCurrency(service.price)}</span>
          </p>
          <div>
            <label className="text-sm font-medium mb-1 block">Yangi narx (so'm) *</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={0}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Sabab (ixtiyoriy)</label>
            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masalan: Narxlar indeksatsiyasi"
            />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors">
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium disabled:opacity-60"
          >
            {loading ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ServicesPage() {
  const [services, setServices] = useState<BackendService[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [activeTotal, setActiveTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState<BackendService | null>(null);
  const [priceService, setPriceService] = useState<BackendService | null>(null);
  const [deleteService, setDeleteService] = useState<BackendService | null>(null);

  const fetchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    departmentsApi.findAll().then((res: any) => {
      const data = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
      setDepartments(data);
    }).catch(() => {});
  }, []);

  const fetchServices = async (overridePage?: number) => {
    try {
      setLoading(true);
      const [res, activeRes] = await Promise.all([
        servicesApi.findMany({
          page: overridePage ?? pagination.page,
          limit: pagination.limit,
          search: search || undefined,
          department_id: deptFilter ? Number(deptFilter) : undefined,
          status: statusFilter || undefined,
          sortBy: 'created_at',
          sortOrder: 'desc',
        }) as any,
        servicesApi.findMany({
          limit: 1,
          status: 'ACTIVE',
          department_id: deptFilter ? Number(deptFilter) : undefined,
        }) as any,
      ]);
      setServices(Array.isArray(res?.data) ? res.data : []);
      if (res?.pagination) {
        setPagination(prev => ({ ...prev, ...res.pagination }));
      }
      setActiveTotal(activeRes?.pagination?.total ?? 0);
    } catch (error: any) {
      toast.error(error?.message || 'Xizmatlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  // Search debounce
  useEffect(() => {
    clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPagination(p => ({ ...p, page: 1 }));
    }, 300);
    return () => clearTimeout(fetchTimerRef.current);
  }, [searchInput]);

  useEffect(() => {
    fetchServices();
  }, [pagination.page, search, deptFilter, statusFilter]);

  const handleDeptFilter = (val: string) => {
    setDeptFilter(val);
    setPagination(p => ({ ...p, page: 1 }));
  };

  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
    setPagination(p => ({ ...p, page: 1 }));
  };

  const handleCreate = async (dto: CreateServiceDto) => {
    try {
      const res = await servicesApi.create(dto) as any;
      if (res?.success) {
        toast.success('Xizmat muvaffaqiyatli yaratildi');
        setShowModal(false);
        fetchServices();
      }
    } catch (e: any) {
      toast.error(e?.message || 'Xatolik yuz berdi');
    }
  };

  const handleUpdate = async (dto: CreateServiceDto) => {
    if (!editService) return;
    try {
      const res = await servicesApi.update(editService.id, dto) as any;
      if (res?.success) {
        toast.success('Xizmat yangilandi');
        setEditService(null);
        setShowModal(false);
        fetchServices();
      }
    } catch (e: any) {
      toast.error(e?.message || 'Xatolik yuz berdi');
    }
  };

  const handlePriceUpdate = async (dto: UpdateServicePriceDto) => {
    if (!priceService) return;
    try {
      const res = await servicesApi.updatePrice(priceService.id, dto) as any;
      if (res?.success) {
        toast.success('Narx yangilandi');
        setPriceService(null);
        fetchServices();
      }
    } catch (e: any) {
      toast.error(e?.message || 'Xatolik yuz berdi');
    }
  };

  const handleDelete = async () => {
    if (!deleteService) return;
    try {
      await servicesApi.remove(deleteService.id);
      toast.success("Xizmat o'chirildi");
      setDeleteService(null);
      fetchServices();
    } catch (e: any) {
      toast.error(e?.message || 'Xatolik yuz berdi');
    }
  };


  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Xizmat nomini qidirish..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={deptFilter}
          onChange={e => handleDeptFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Barcha bo'limlar</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => handleStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Barcha holatlar</option>
          <option value="ACTIVE">Faol</option>
          <option value="INACTIVE">Nofaol</option>
          <option value="ARCHIVED">Arxiv</option>
        </select>
        <button
          onClick={() => { setEditService(null); setShowModal(true); }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium whitespace-nowrap"
        >
          <Plus size={16} />
          Yangi xizmat
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Jami xizmatlar', value: pagination.total },
          { label: 'Faol xizmatlar', value: activeTotal },
          { label: "Bo'limlar soni", value: departments.length },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-border text-center">
            <div className="text-xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Xizmat nomi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Bo'lim</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Davomiyligi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Narxi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Holat</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Shifokorlar</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Tashriflar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    Xizmatlar topilmadi
                  </td>
                </tr>
              ) : (
                services.map((service, idx) => (
                  <tr key={service.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {(pagination.page - 1) * pagination.limit + idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{service.name}</div>
                      {service.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {service.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {service.department?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {service.duration_min} daq
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {formatCurrency(service.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[service.status]}`}>
                        {STATUS_LABELS[service.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm text-center">
                      {service._count?.service_users ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm text-center">
                      {service._count?.visit_services ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          title="Narxni yangilash"
                          onClick={() => setPriceService(service)}
                          className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-500 transition-colors"
                        >
                          <DollarSign size={15} />
                        </button>
                        <button
                          onClick={() => { setEditService(service); setShowModal(true); }}
                          className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteService(service)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center px-4 py-3 border-t border-border">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                disabled={pagination.page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
                Oldingi
              </button>

              <div className="flex items-center gap-1 mx-1">
                {(() => {
                  const total = pagination.totalPages;
                  const cur = pagination.page;
                  const pages: (number | '...')[] = [];
                  if (total <= 7) {
                    for (let i = 1; i <= total; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (cur > 3) pages.push('...');
                    for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
                    if (cur < total - 2) pages.push('...');
                    pages.push(total);
                  }
                  return pages.map((p, i) =>
                    p === '...' ? (
                      <span key={`dots-${i}`} className="w-8 text-center text-xs text-muted-foreground">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPagination(prev => ({ ...prev, page: p as number }))}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                          p === cur
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'border border-border hover:bg-muted text-foreground'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  );
                })()}
              </div>

              <button
                onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Keyingi
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

      {showModal && (
        <ServiceModal
          service={editService}
          departments={departments}
          onClose={() => { setShowModal(false); setEditService(null); }}
          onSave={editService ? handleUpdate : handleCreate}
        />
      )}

      {priceService && (
        <PriceModal
          service={priceService}
          onClose={() => setPriceService(null)}
          onSave={handlePriceUpdate}
        />
      )}

      <AlertDialog open={!!deleteService} onOpenChange={() => setDeleteService(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xizmatni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteService?.name}" xizmatini o'chirmoqchimisiz? Bu amal qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
