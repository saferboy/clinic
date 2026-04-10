import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Shield, Key, Loader2, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { usersService } from '../api/users.service';
import type { FrontendUser } from '../api/users.types';

// Role type va mapping
type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'accountant';

const backendRoleToFrontend: Record<string, UserRole> = {
  SuperAdmin: 'admin',
  Admin: 'admin',
  Doctor: 'doctor',
  Nurse: 'nurse',
  Receptionist: 'receptionist',
  Accountant: 'accountant',
};

const getRoleName = (user: FrontendUser): UserRole => {
  if (user.role?.name) {
    return backendRoleToFrontend[user.role.name] || 'receptionist';
  }
  return 'receptionist';
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  doctor: 'Shifokor',
  nurse: 'Hamshira',
  receptionist: 'Registrator',
  accountant: 'Buxgalter',
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  doctor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  nurse: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  receptionist: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  accountant: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const roleAvatarColors: Record<UserRole, string> = {
  admin: 'bg-red-500',
  doctor: 'bg-blue-500',
  nurse: 'bg-pink-500',
  receptionist: 'bg-green-500',
  accountant: 'bg-amber-500',
};

// Permission matrix
const permissions: Record<string, UserRole[]> = {
  'Dashboard ko\'rish': ['admin', 'doctor', 'nurse', 'receptionist', 'accountant'],
  'Mijozlar boshqarish': ['admin', 'doctor', 'receptionist', 'accountant'],
  'Tashriflar boshqarish': ['admin', 'doctor', 'nurse', 'receptionist', 'accountant'],
  "To'lovlar boshqarish": ['admin', 'receptionist', 'accountant'],
  'Xizmatlar boshqarish': ['admin', 'doctor', 'accountant'],
  'Xonalar boshqarish': ['admin', 'doctor', 'nurse', 'receptionist'],
  'Hisobotlar ko\'rish': ['admin', 'doctor', 'receptionist', 'accountant'],
  'Sozlamalar': ['admin'],
  'Foydalanuvchilar': ['admin'],
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// ---------- MODAL COMPONENT ----------
function UserModal({ user, roles, onClose, onSave }: {
  user: FrontendUser | null;
  roles: { id: number; name: string }[];
  onClose: () => void;
  onSave: (data: { login: string; password?: string; full_name?: string; phone?: string; email?: string; role_id?: number; status?: 'ACTIVE' | 'INACTIVE' }) => void;
}) {
  const [form, setForm] = useState({
    login: user?.login || '',
    full_name: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role_id: user?.role?.id ?? (roles[0]?.id ?? 0),
    password: '',
    status: user?.status || 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.login.trim()) newErrors.login = 'Login majburiy';
    if (!user && !form.password.trim()) newErrors.password = 'Parol majburiy';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email noto\'g\'ri formatda';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave({
        login: form.login.trim(),
        ...(form.password.trim() && { password: form.password }),
        ...(form.full_name.trim() && { full_name: form.full_name.trim() }),
        ...(form.phone.trim() && { phone: form.phone.trim() }),
        ...(form.email.trim() && { email: form.email.trim() }),
        ...(form.role_id && { role_id: form.role_id }),
        status: form.status,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">{user?.id ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Login *</label>
              <input value={form.login} onChange={e => setForm({ ...form, login: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${errors.login ? 'border-red-500' : 'border-border'} bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="foydalanuvchi_logini" />
              {errors.login && <p className="text-xs text-red-500 mt-1">{errors.login}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">To'liq ism</label>
              <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ism familiya" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Telefon</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+998901234567" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${errors.email ? 'border-red-500' : 'border-border'} bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="email@clinic.uz" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Rol</label>
              <select value={form.role_id} onChange={e => setForm({ ...form, role_id: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            {!user && (
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Parol *</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border ${errors.password ? 'border-red-500' : 'border-border'} bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Boshlang'ich parol" />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
            )}
            <div className="col-span-2 flex items-center gap-3">
              <label className="text-sm font-medium">Faollik:</label>
              <button onClick={() => setForm({ ...form, status: form.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors ${form.status === 'ACTIVE' ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${form.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm text-muted-foreground">{form.status === 'ACTIVE' ? 'Faol' : 'Nofaol'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors">Bekor qilish</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium">Saqlash</button>
        </div>
      </div>
    </div>
  );
}

// ---------- PAGINATION COMPONENT ----------
function Pagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
}) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 rounded-xl border border-border p-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          {total > 0 ? `${start}-${end} / ${total}` : '0 natija'}
        </span>
        <select
          value={limit}
          onChange={e => onLimitChange(Number(e.target.value))}
          className="px-2 py-1 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PAGE_SIZE_OPTIONS.map(size => (
            <option key={size} value={size}>{size} ta</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-2 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-2 text-muted-foreground">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-2 rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ---------- FILTER BAR COMPONENT ----------
function FilterBar({
  roles,
  search,
  onSearchChange,
  filterRole,
  onFilterRoleChange,
  filterStatus,
  onFilterStatusChange,
  onReset,
}: {
  roles: { id: number; name: string }[];
  search: string;
  onSearchChange: (v: string) => void;
  filterRole: number | undefined;
  onFilterRoleChange: (v: number | undefined) => void;
  filterStatus: 'ACTIVE' | 'INACTIVE' | undefined;
  onFilterStatusChange: (v: 'ACTIVE' | 'INACTIVE' | undefined) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasFilters = filterRole !== undefined || filterStatus !== undefined;

  return (
    <div className="space-y-3">
      {/* Search + Toggle filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Ism, login, email, telefon bo'yicha qidirish..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setOpen(!open)}
          className={`px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 border transition-colors ${
            open || hasFilters
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
              : 'bg-white dark:bg-slate-800 border-border text-muted-foreground hover:bg-muted'
          }`}
        >
          <Filter size={16} />
          Filtrlar
          {hasFilters && (
            <span className="w-2 h-2 rounded-full bg-blue-600" />
          )}
        </button>
        {hasFilters && (
          <button
            onClick={onReset}
            className="px-4 py-2.5 rounded-xl text-sm border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            Tozalash
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {open && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-border p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Rol bo'yicha</label>
            <select
              value={filterRole ?? ''}
              onChange={e => onFilterRoleChange(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Barchasi</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block text-muted-foreground">Holat bo'yicha</label>
            <select
              value={filterStatus ?? ''}
              onChange={e => onFilterStatusChange((e.target.value as 'ACTIVE' | 'INACTIVE' | '') || undefined)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Barchasi</option>
              <option value="ACTIVE">Faol</option>
              <option value="INACTIVE">Nofaol</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- PASSWORD RESET MODAL ----------
function PasswordResetModal({ user, onClose, onReset }: {
  user: FrontendUser;
  onClose: () => void;
  onReset: (id: number, newPassword?: string) => Promise<void>;
}) {
  const [newPassword, setNewPassword] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      await onReset(user.id, useCustom ? newPassword : undefined);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Key size={18} className="text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold">Parolni tiklash</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">
              Foydalanuvchi: <span className="font-medium text-foreground">{user.fullName || user.login}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setUseCustom(false); setNewPassword(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                !useCustom
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              Avtomatik (1234)
            </button>
            <button
              onClick={() => setUseCustom(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                useCustom
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              Yangi parol
            </button>
          </div>

          {useCustom && (
            <div>
              <label className="text-sm font-medium mb-1 block">Yangi parol</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Kamida 4 ta belgi"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              ⚠️ Parol o'zgargandan so'ng foydalanuvchiga yangi parolni yetkazing.
            </p>
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-border">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors">Bekor qilish</button>
          <button
            onClick={handleReset}
            disabled={useCustom && newPassword.length < 4}
            className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl text-sm hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Tiklanmoqda...' : 'Parolni tiklash'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- MAIN PAGE ----------
export function UsersPage() {
  const [users, setUsers] = useState<FrontendUser[]>([]);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<FrontendUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<FrontendUser | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'permissions'>('list');

  // Pagination & filter state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<number | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<'ACTIVE' | 'INACTIVE' | undefined>(undefined);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  // User'larni yuklash
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { users: data, meta } = await usersService.getAll({
        page,
        limit,
        search: search || undefined,
        role_id: filterRole,
        status: filterStatus,
      });
      setUsers(data);
      setTotalPages(meta.totalPages);
      setTotal(meta.total);
    } catch (err: any) {
      setError(err.message || 'User\'larni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filterRole, filterStatus]);

  // Rollarni yuklash
  const loadRoles = useCallback(async () => {
    try {
      const { api } = await import('../api/client');
      const rolesData = await api.get<any[]>('/user-roles', true);
      if (Array.isArray(rolesData)) {
        setRoles(rolesData.map((r: any) => ({ id: r.id, name: r.name })));
      }
    } catch (err) {
      console.error('Rollarni yuklashda xatolik:', err);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // Search debounce
  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Saqlash (yaratish yoki yangilash)
  const handleSave = async (data: { login: string; password?: string; full_name?: string; phone?: string; email?: string; role_id?: number; status?: 'ACTIVE' | 'INACTIVE' }) => {
    try {
      if (editUser) {
        await usersService.update(editUser.id, data);
        toast.success('Foydalanuvchi muvaffaqiyatli yangilandi');
      } else {
        await usersService.create(data);
        toast.success('Yangi foydalanuvchi muvaffaqiyatli yaratildi');
      }
      setShowModal(false);
      setEditUser(null);
      await loadUsers();
    } catch (err: any) {
      const message = err.message || 'Saqlashda xatolik yuz berdi';
      toast.error(message);
    }
  };

  // O'chirish
  const handleDelete = async (id: number) => {
    if (confirm('Foydalanuvchini o\'chirishni tasdiqlaysizmi?')) {
      try {
        await usersService.delete(id);
        toast.success('Foydalanuvchi muvaffaqiyatli o\'chirildi');
        await loadUsers();
      } catch (err: any) {
        toast.error(err.message || 'O\'chirishda xatolik yuz berdi');
      }
    }
  };

  // Parolni tiklash
  const handleResetPassword = async (id: number, newPassword?: string) => {
    try {
      const result = await usersService.resetPassword(id, newPassword);
      const msg = newPassword
        ? `Parol o'zgartirildi`
        : `Parol tiklandi: ${result.tempPassword}`;
      toast.success(msg, { duration: 6000 });
      if (!newPassword) {
        toast.info(`Vaqtinchalik parol: ${result.tempPassword}`, { duration: 8000 });
      }
    } catch (err: any) {
      toast.error(err.message || 'Parolni tiklashda xatolik yuz berdi');
      throw err;
    }
  };

  // Filter reset
  const handleResetFilters = () => {
    setSearchInput('');
    setSearch('');
    setFilterRole(undefined);
    setFilterStatus(undefined);
    setPage(1);
  };

  const roleName = (user: FrontendUser): UserRole => getRoleName(user);

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <span className="ml-3 text-muted-foreground">Yuklanmoqda...</span>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        <button onClick={loadUsers} className="mt-2 text-sm text-blue-600 hover:underline">Qayta urinish</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('list')}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${activeView === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-border text-muted-foreground hover:bg-muted'}`}
          >
            Foydalanuvchilar
          </button>
          <button
            onClick={() => setActiveView('permissions')}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${activeView === 'permissions' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-border text-muted-foreground hover:bg-muted'}`}
          >
            Ruxsatlar matritsasi
          </button>
        </div>
        <button
          onClick={() => { setEditUser(null); setShowModal(true); }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={16} />
          Yangi foydalanuvchi
        </button>
      </div>

      {activeView === 'list' ? (
        <>
          {/* Role stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(['admin', 'doctor', 'nurse', 'receptionist', 'accountant'] as UserRole[]).map(role => (
              <div key={role} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-border text-center">
                <div className={`text-lg font-bold ${roleColors[role].split(' ')[1]}`}>
                  {users.filter(u => roleName(u) === role).length}
                </div>
                <div className="text-xs text-muted-foreground">{roleLabels[role]}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <FilterBar
            roles={roles}
            search={searchInput}
            onSearchChange={setSearchInput}
            filterRole={filterRole}
            onFilterRoleChange={v => { setFilterRole(v); setPage(1); }}
            filterStatus={filterStatus}
            onFilterStatusChange={v => { setFilterStatus(v); setPage(1); }}
            onReset={handleResetFilters}
          />

          {/* User cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => {
              const role = roleName(user);
              const isActive = user.status === 'ACTIVE';
              return (
                <div key={user.id} className={`bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm p-5 transition-all hover:shadow-md ${!isActive ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full ${roleAvatarColors[role]} flex items-center justify-center text-white font-semibold`}>
                        {(user.fullName || user.login).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">{user.fullName || user.login}</div>
                        <div className="text-xs text-muted-foreground">{user.email || user.login}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditUser(user); setShowModal(true); }} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                        <Edit size={15} />
                      </button>
                      {role !== 'admin' && (
                        <button onClick={() => handleDelete(user.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-500">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[role]}`}>
                      {roleLabels[role]}
                    </span>
                    {user.role?.name && user.role.name !== role && (
                      <span className="text-xs text-muted-foreground">{user.role.name}</span>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">{user.phone || '—'}</div>
                    <div className="flex gap-2">
                      <button title="Ruxsatlar" className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                        <Shield size={14} />
                      </button>
                      <button
                        title="Parolni tiklash"
                        onClick={() => setResetPasswordUser(user)}
                        className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
                      >
                        <Key size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {users.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              {total === 0 ? 'Hech qanday foydalanuvchi topilmadi' : 'Natijalar yo\'q'}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              page={page}
              limit={limit}
              total={total}
              totalPages={totalPages}
              onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onLimitChange={(l) => { setLimit(l); setPage(1); }}
            />
          )}
        </>
      ) : (
        /* Permissions Matrix */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Ruxsatlar matritsasi</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Har bir rol uchun ruxsatlar</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-48">Ruxsat</th>
                  {(['admin', 'doctor', 'nurse', 'receptionist', 'accountant'] as UserRole[]).map(role => (
                    <th key={role} className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                      <span className={`px-2 py-0.5 rounded-full ${roleColors[role]}`}>{roleLabels[role]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissions).map(([perm, roleList]) => (
                  <tr key={perm} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 text-sm text-foreground">{perm}</td>
                    {(['admin', 'doctor', 'nurse', 'receptionist', 'accountant'] as UserRole[]).map(role => (
                      <td key={role} className="px-4 py-3 text-center">
                        {roleList.includes(role) ? (
                          <span className="text-green-600 text-base">✓</span>
                        ) : (
                          <span className="text-muted-foreground text-base">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <UserModal
          user={editUser}
          roles={roles}
          onClose={() => { setShowModal(false); setEditUser(null); }}
          onSave={handleSave}
        />
      )}

      {resetPasswordUser && (
        <PasswordResetModal
          user={resetPasswordUser}
          onClose={() => setResetPasswordUser(null)}
          onReset={handleResetPassword}
        />
      )}
    </div>
  );
}
