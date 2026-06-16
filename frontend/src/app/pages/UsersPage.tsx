import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { Plus, Edit, Trash2, Shield, Key, Loader2, Search, Filter, Eye, EyeOff } from 'lucide-react';
import { PaginationBar } from '../components/ui/PaginationBar';
import { BaseModal } from '../components/ui/BaseModal';
import { toast } from 'sonner';
import { usersService, type UsersStats } from '../api/users.service';
import type { FrontendUser } from '../api/users.types';
import { userRolesApi } from '../api/user-roles.service';

type RoleWithPermissions = { id: number; name: string; permissions: Record<string, any> | null };

const PERMISSION_RESOURCES: { key: string; label: string }[] = [
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

const ACTION_LETTERS: { key: 'create' | 'read' | 'update' | 'delete'; letter: string; title: string }[] = [
  { key: 'create', letter: 'Q',  title: "Qo'shish" },
  { key: 'read',   letter: 'K',  title: "Ko'rish" },
  { key: 'update', letter: 'T',  title: 'Tahrirlash' },
  { key: 'delete', letter: "O'", title: "O'chirish" },
];

function getActionGranted(perms: Record<string, any> | null | undefined, resource: string, action: string): boolean {
  if (!perms) return false;
  if (perms.all === true) return true;
  return perms[resource]?.[action] === true;
}

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

// ---------- MODAL COMPONENT ----------
function UserModal({ user, roles, onClose, onSave }: {
  user: FrontendUser | null;
  roles: { id: number; name: string }[];
  onClose: () => void;
  onSave: (data: { login: string; password?: string; full_name?: string; phone?: string; role_id?: number; status?: 'ACTIVE' | 'INACTIVE' }) => Promise<void>;
}) {
  const [form, setForm] = useState({
    login: user?.login || '',
    full_name: user?.fullName || '',
    phone: user?.phone || '+998',
    role_id: user?.role?.id ?? (roles[0]?.id ?? 0),
    password: '',
    status: user?.status || 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.login.trim()) newErrors.login = 'Iltimos, loginni kiriting';
    if (!form.full_name.trim()) newErrors.full_name = 'Iltimos, to\'liq ismni kiriting';
    if (!form.phone.trim() || form.phone.trim() === '+998') newErrors.phone = 'Iltimos, telefon raqamini kiriting';
    if (!user && !form.password.trim()) newErrors.password = 'Iltimos, parolni kiriting';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await onSave({
        login: form.login.trim(),
        ...(form.password.trim() && { password: form.password }),
        ...(form.full_name.trim() && { full_name: form.full_name.trim() }),
        ...(form.phone.trim() && { phone: form.phone.trim() }),
        ...(form.role_id && { role_id: form.role_id }),
        status: form.status,
      });
    } catch (err: any) {
      // Backend validation xatolarini tegishli inputlarga joylash
      const backendErrors: Record<string, string[]> = err?.data?.errors || err?.errors || {};
      if (Object.keys(backendErrors).length > 0) {
        const fieldMessages: Record<string, string> = {
          phone: 'Telefon raqami noto\'g\'ri. Masalan: +998901234567',
          login: 'Bu login allaqachon band',
          password: 'Parol talablarga javob bermaydi',
          full_name: 'To\'liq ism noto\'g\'ri',
        };
        const newErrors: Record<string, string> = {};
        Object.keys(backendErrors).forEach(field => {
          newErrors[field] = fieldMessages[field] || backendErrors[field][0];
        });
        setErrors(prev => ({ ...prev, ...newErrors }));
      }
    }
  };

  return (
    <BaseModal
      title={user?.id ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'}
      onClose={onClose}
      size="md"
      onSave={handleSubmit}
    >
      <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Login *</label>
              <input value={form.login} onChange={e => setForm({ ...form, login: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${errors.login ? 'border-red-500' : 'border-border'} bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="foydalanuvchi_logini" />
              {errors.login && <p className="text-xs text-red-500 mt-1">{errors.login}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">To'liq ism *</label>
              <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${errors.full_name ? 'border-red-500' : 'border-border'} bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Ism familiya" />
              {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Telefon *</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-border'} bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="+998901234567" />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
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
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className={`w-full px-3 py-2 pr-10 rounded-xl border ${errors.password ? 'border-red-500' : 'border-border'} bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Boshlang'ich parol"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    title={showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
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
    </BaseModal>
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
            placeholder="Ism, login, telefon bo'yicha qidirish..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setOpen(!open)}
          className={`px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 border transition-colors ${open || hasFilters
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
  const [showPassword, setShowPassword] = useState(false);

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
    <BaseModal
      title="Parolni tiklash"
      onClose={onClose}
      size="md"
      footer={
        <>
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors">Bekor qilish</button>
          <button
            onClick={handleReset}
            disabled={useCustom && newPassword.length < 4}
            className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl text-sm hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Tiklanmoqda...' : 'Parolni tiklash'}
          </button>
        </>
      }
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
          <Key size={18} className="text-amber-600" />
        </div>
        <p className="text-sm text-muted-foreground">Foydalanuvchi: <span className="font-medium text-foreground">{user.fullName || user.login}</span></p>
      </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">
              Foydalanuvchi: <span className="font-medium text-foreground">{user.fullName || user.login}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setUseCustom(false); setNewPassword(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${!useCustom
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted'
                }`}
            >
              Avtomatik (1234)
            </button>
            <button
              onClick={() => setUseCustom(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${useCustom
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Kamida 4 ta belgi"
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  title={showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
        <p className="text-xs text-amber-700 dark:text-amber-400">
          ⚠️ Parol o'zgargandan so'ng foydalanuvchiga yangi parolni yetkazing.
        </p>
      </div>
    </BaseModal>
  );
}

// ---------- MAIN PAGE ----------
export function UsersPage() {
  const [users, setUsers] = useState<FrontendUser[]>([]);
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<FrontendUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<FrontendUser | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'permissions'>('list');
  const [stats, setStats] = useState<UsersStats | null>(null);

  // Pagination & filter state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filterRole, setFilterRole] = useState<number | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<'ACTIVE' | 'INACTIVE' | undefined>(undefined);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  // Har bir loadUsers chaqiruvining so'rovini abort qilish uchun ref
  const loadUsersAbortRef = useRef<AbortController | null>(null);

  // User'larni yuklash
  const loadUsers = useCallback(async () => {
    // Avvalgi in-flight so'rovni bekor qilish
    if (loadUsersAbortRef.current) loadUsersAbortRef.current.abort();
    loadUsersAbortRef.current = new AbortController();
    const signal = loadUsersAbortRef.current.signal;

    try {
      setLoading(true);
      setError(null);
      const { users: data, meta } = await usersService.getAll({
        page,
        limit,
        search: search || undefined,
        role_id: filterRole,
        status: filterStatus,
      }, signal);
      setUsers(data);
      setTotalPages(meta.totalPages);
      setTotal(meta.total);
    } catch (err: any) {
      if (err?.name === 'AbortError') return; // bekor qilingan so'rov — e'tibor bermaslik
      setError(err.message || 'User\'larni yuklashda xatolik');
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [page, limit, search, filterRole, filterStatus]);

  // Rollarni yuklash (matritsa uchun permissions ham kerak)
  const loadRoles = useCallback(async () => {
    try {
      const response = await userRolesApi.findAll();
      const list = (response as any)?.data ?? response;
      if (Array.isArray(list)) {
        setRoles(list.map((r: any) => ({ id: r.id, name: r.name, permissions: r.permissions ?? null })));
      }
    } catch (err) {
      console.error('Rollarni yuklashda xatolik:', err);
    }
  }, []);

  // Statistikani yuklash (filterga bog'liq emas — jami sonlar)
  const loadStats = useCallback(async () => {
    try {
      const data = await usersService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Statistikani yuklashda xatolik:', err);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadRoles();
    loadStats();
  }, [loadRoles, loadStats]);

  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 400);

  useEffect(() => {
    setPage(1);
  }, [search]);

  // Saqlash (yaratish yoki yangilash)
  const handleSave = async (data: { login: string; password?: string; full_name?: string; phone?: string; role_id?: number; status?: 'ACTIVE' | 'INACTIVE' }) => {
    try {
      const isCreate = !editUser;
      if (editUser) {
        await usersService.update(editUser.id, data);
        toast.success('Foydalanuvchi muvaffaqiyatli yangilandi');
      } else {
        await usersService.create(data);
        toast.success('Yangi foydalanuvchi muvaffaqiyatli yaratildi');
      }
      setShowModal(false);
      setEditUser(null);

      // Yangi foydalanuvchi yaratilganda — filterlarni tozalab, uni ro'yxatda ko'rsatamiz.
      // Aks holda joriy filter (masalan, search='root') yangi userni ko'rsatmasligi mumkin.
      if (isCreate) {
        setSearchInput('');
        setFilterRole(undefined);
        setFilterStatus(undefined);
        setPage(1);
      }

      await Promise.all([loadUsers(), loadStats()]);
    } catch (err: any) {
      // Backend validation xatosi bo'lsa — modal ichiga qaytaramiz (toast emas)
      const hasFieldErrors = err?.data?.errors && Object.keys(err.data.errors).length > 0;
      if (!hasFieldErrors) {
        toast.error(err.message || 'Saqlashda xatolik yuz berdi');
      }
      throw err; // modal ichidagi handleSubmit ushlab oladi
    }
  };

  // O'chirish
  const handleDelete = async (id: number) => {
    if (confirm('Foydalanuvchini o\'chirishni tasdiqlaysizmi?')) {
      try {
        await usersService.delete(id);
        toast.success('Foydalanuvchi muvaffaqiyatli o\'chirildi');
        await Promise.all([loadUsers(), loadStats()]);
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
          onClick={() => {
            if (loadUsersAbortRef.current) loadUsersAbortRef.current.abort();
            setSearchInput('');
            setEditUser(null);
            setShowModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={16} />
          Yangi foydalanuvchi
        </button>
      </div>

      {activeView === 'list' ? (
        <>
          {/* Role stats — filterdan mustaqil, jami sonlar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(['admin', 'doctor', 'nurse', 'receptionist', 'accountant'] as UserRole[]).map(role => {
              const count = stats?.byRole.reduce((sum, r) => {
                const fkey = r.role_name ? backendRoleToFrontend[r.role_name] : undefined;
                return fkey === role ? sum + r.count : sum;
              }, 0) ?? 0;
              return (
                <div key={role} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-border text-center">
                  <div className={`text-lg font-bold ${roleColors[role].split(' ')[1]}`}>
                    {count}
                  </div>
                  <div className="text-xs text-muted-foreground">{roleLabels[role]}</div>
                </div>
              );
            })}
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
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-border p-4">
              <PaginationBar
                page={page}
                limit={limit}
                total={total}
                totalPages={totalPages}
                onPageChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                onLimitChange={l => { setLimit(l); setPage(1); }}
              />
            </div>
          )}
        </>
      ) : (
        /* Permissions Matrix */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Ruxsatlar matritsasi</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Har bir rol uchun resurslar bo'yicha ruxsatlar (Q — Qo'shish, K — Ko'rish, T — Tahrirlash, O' — O'chirish)
            </p>
          </div>
          <div className="overflow-x-auto">
            {roles.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Rollar topilmadi</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-44 sticky left-0 bg-muted/30">Resurs</th>
                    {roles.map(role => {
                      const frontendKey = backendRoleToFrontend[role.name];
                      const colorClass = frontendKey ? roleColors[frontendKey] : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
                      return (
                        <th key={role.id} className="px-3 py-3 text-center text-xs font-medium text-muted-foreground min-w-[120px]">
                          <span className={`px-2 py-0.5 rounded-full whitespace-nowrap ${colorClass}`}>{role.name}</span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_RESOURCES.map(res => (
                    <tr key={res.key} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 text-sm text-foreground font-medium sticky left-0 bg-white dark:bg-slate-800">{res.label}</td>
                      {roles.map(role => (
                        <td key={role.id} className="px-3 py-3 text-center">
                          <div className="inline-flex gap-1 font-mono text-xs">
                            {ACTION_LETTERS.map(a => {
                              const granted = getActionGranted(role.permissions, res.key, a.key);
                              return (
                                <span
                                  key={a.key}
                                  title={a.title}
                                  className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded ${
                                    granted
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 font-semibold'
                                      : 'bg-muted text-muted-foreground/40'
                                  }`}
                                >
                                  {a.letter}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
