import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Shield, Key, Loader2, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { userRolesApi, UserRole, CreateUserRoleDto, UpdateUserRoleDto } from '../api/user-roles.service';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export function UserRolesPage() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editRole, setEditRole] = useState<UserRole | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserRole | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userRolesApi.findMany({
        page,
        limit,
        search: search || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        sortBy: 'name',
        sortOrder: 'asc' as const,
      });

      const backendData = response.data as any;
      setRoles(Array.isArray(backendData?.data) ? backendData.data : []);
      if (backendData?.pagination) {
        setTotal(backendData.pagination.total ?? 0);
        setTotalPages(backendData.pagination.totalPages ?? 0);
      }
    } catch (error: any) {
      toast.error(error.message || 'Rollarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleSave = async (dto: CreateUserRoleDto | UpdateUserRoleDto) => {
    try {
      if (editRole) {
        await userRolesApi.update(editRole.id, dto as UpdateUserRoleDto);
        toast.success('Rol muvaffaqiyatli yangilandi');
      } else {
        await userRolesApi.create(dto as CreateUserRoleDto);
        toast.success('Rol muvaffaqiyatli yaratildi');
      }
      setShowModal(false);
      setEditRole(null);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message || 'Saqlashda xatolik');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await userRolesApi.remove(id);
      toast.success('Rol muvaffaqiyatli o\'chirildi');
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message || 'O\'chirishda xatolik');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const openEditModal = (role: UserRole) => {
    setEditRole(role);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditRole(null);
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      INACTIVE: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      ARCHIVED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Faol',
      INACTIVE: 'Nofaol',
      ARCHIVED: 'Arxivlangan',
    };
    return labels[status] || status;
  };

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rol nomi yoki tavsif bo'yicha qidirish..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none"
            >
              <option value="ALL">Barcha holat</option>
              <option value="ACTIVE">Faol</option>
              <option value="INACTIVE">Nofaol</option>
              <option value="ARCHIVED">Arxivlangan</option>
            </select>
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus size={16} />
              <span>Yangi rol</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Jami rollar', value: total },
          { label: 'Faol', value: roles.filter(r => r.status === 'ACTIVE').length },
          { label: 'Nofaol', value: roles.filter(r => r.status === 'INACTIVE').length },
          { label: 'Arxivlangan', value: roles.filter(r => r.status === 'ARCHIVED').length },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-border text-center">
            <div className="text-xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Rol nomi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tavsif</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Ruxsatlar</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Holat</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Yaratilgan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role, idx) => (
                    <tr key={role.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-xs">{startItem + idx}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Shield size={14} className="text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="font-medium text-foreground">{role.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                        {role.description || <span className="text-muted-foreground/50">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {role.permissions ? (
                          <span className="px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium">
                            {Object.keys(role.permissions).length} ta ruxsat
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(role.status)}`}>
                          {getStatusLabel(role.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(role.created_at).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(role)}
                            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(role)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                            title="O'chirish"
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
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  {startItem}-{endItem} / {total} ta rol
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {roles.length === 0 && !loading && (
              <div className="px-4 py-12 text-center text-muted-foreground">
                Rollar topilmadi
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <RoleModal
          role={editRole}
          onClose={() => { setShowModal(false); setEditRole(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <DeleteConfirmDialog
          role={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm.id)}
        />
      )}
    </div>
  );
}

// ---------- PERMISSIONS CONFIG ----------
const PERMISSIONS_CONFIG = [
  { key: 'client',       label: 'Mijozlar' },
  { key: 'client-group', label: 'Mijoz guruhlari' },
  { key: 'visit',        label: 'Tashriflar' },
  { key: 'payment',      label: "To'lovlar" },
  { key: 'service',      label: 'Xizmatlar' },
  { key: 'room',         label: 'Xonalar' },
  { key: 'department',   label: "Bo'limlar" },
  { key: 'report',       label: 'Hisobotlar' },
  { key: 'user',         label: 'Foydalanuvchilar' },
  { key: 'role',         label: 'Rollar' },
  { key: 'source',       label: 'Manbalar' },
  { key: 'referral',     label: 'Tavsiyalar' },
];

const ACTIONS = [
  { key: 'create', label: "Qo'shish" },
  { key: 'read',   label: "Ko'rish" },
  { key: 'update', label: 'Tahrirlash' },
  { key: 'delete', label: "O'chirish" },
];

// ---------- MODAL COMPONENT ----------
function RoleModal({
  role,
  onClose,
  onSave,
}: {
  role: UserRole | null;
  onClose: () => void;
  onSave: (dto: CreateUserRoleDto | UpdateUserRoleDto) => void;
}) {
  const [isAll, setIsAll] = useState(role?.permissions?.all === true);
  const [form, setForm] = useState<CreateUserRoleDto & { status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' }>({
    name: role?.name || '',
    description: role?.description || '',
    permissions: role?.permissions || {},
    status: role?.status || 'ACTIVE',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getPerm = (resource: string, action: string): boolean => {
    if (isAll) return true;
    return (form.permissions as any)?.[resource]?.[action] === true;
  };

  const togglePerm = (resource: string, action: string) => {
    const cur = (form.permissions as any) || {};
    const res = cur[resource] || { create: false, read: false, update: false, delete: false };
    setForm(prev => ({
      ...prev,
      permissions: { ...cur, [resource]: { ...res, [action]: !res[action] } },
    }));
  };

  const toggleRow = (resource: string) => {
    const cur = (form.permissions as any) || {};
    const allTrue = ACTIONS.every(a => cur[resource]?.[a.key] === true);
    setForm(prev => ({
      ...prev,
      permissions: {
        ...cur,
        [resource]: Object.fromEntries(ACTIONS.map(a => [a.key, !allTrue])),
      },
    }));
  };

  const handleIsAllChange = (checked: boolean) => {
    setIsAll(checked);
    setForm(prev => ({ ...prev, permissions: checked ? { all: true } : {} }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Rol nomi majburiy';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const dto: CreateUserRoleDto | UpdateUserRoleDto = {
      name: form.name.trim(),
      ...(form.description?.trim() && { description: form.description.trim() }),
      permissions: form.permissions || {},
    };
    if (role) {
      (dto as UpdateUserRoleDto).status = form.status;
      onSave(dto as UpdateUserRoleDto);
    } else {
      onSave(dto as CreateUserRoleDto);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <h2 className="text-base font-semibold">
            {role?.id ? 'Rolni tahrirlash' : 'Yangi rol yaratish'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">

          {/* Nomi + Tavsif */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-sm font-medium mb-1 block">Rol nomi *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${errors.name ? 'border-red-500' : 'border-border'} bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Masalan: Shifokor, Registrator"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {role && (
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-medium mb-1 block">Holat</label>
                <select
                  value={form.status || 'ACTIVE'}
                  onChange={e => setForm({ ...form, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Faol</option>
                  <option value="INACTIVE">Nofaol</option>
                  <option value="ARCHIVED">Arxivlangan</option>
                </select>
              </div>
            )}

            <div className={role ? 'col-span-2' : 'col-span-2'}>
              <label className="text-sm font-medium mb-1 block">Tavsif</label>
              <textarea
                value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                placeholder="Rol vazifasi haqida qisqacha..."
              />
            </div>
          </div>

          {/* Ruxsatlar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Key size={14} />
                <span>Ruxsatlar</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                <input
                  type="checkbox"
                  checked={isAll}
                  onChange={e => handleIsAllChange(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600"
                />
                <span className="text-muted-foreground">Barcha huquqlar (SuperAdmin)</span>
              </label>
            </div>

            <div className={`rounded-xl border border-border overflow-hidden transition-opacity ${isAll ? 'opacity-40 pointer-events-none' : ''}`}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Resurs</th>
                    {ACTIONS.map(a => (
                      <th key={a.key} className="px-2 py-2.5 text-center font-medium text-muted-foreground w-20">
                        {a.label}
                      </th>
                    ))}
                    <th className="px-2 py-2.5 text-center font-medium text-muted-foreground w-16">Barchasi</th>
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS_CONFIG.map((res, i) => {
                    const rowAll = ACTIONS.every(a => getPerm(res.key, a.key));
                    return (
                      <tr key={res.key} className={`border-b border-border last:border-0 ${i % 2 !== 0 ? 'bg-muted/10' : ''}`}>
                        <td className="px-3 py-2 font-medium text-foreground">{res.label}</td>
                        {ACTIONS.map(a => (
                          <td key={a.key} className="px-2 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={getPerm(res.key, a.key)}
                              onChange={() => togglePerm(res.key, a.key)}
                              className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                            />
                          </td>
                        ))}
                        <td className="px-2 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={rowAll}
                            onChange={() => toggleRow(res.key)}
                            className="w-4 h-4 rounded cursor-pointer accent-purple-600"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-border flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium"
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- DELETE CONFIRMATION ----------
function DeleteConfirmDialog({
  role,
  onClose,
  onConfirm
}: {
  role: UserRole;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} className="text-red-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Rolni o'chirish</h3>
          <p className="text-sm text-muted-foreground mb-6">
            <span className="font-medium">{role.name}</span> rolini o'chirmoqchimisiz? Bu amal qaytarib bo'lmaydi.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors"
            >
              Bekor qilish
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 transition-colors font-medium"
            >
              O'chirish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
