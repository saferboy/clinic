import { useState } from 'react';
import { Plus, Edit, Trash2, X, ToggleLeft, ToggleRight, Shield, Key } from 'lucide-react';
import { mockUsers, getStatusLabel } from '../mockData';
import { User, UserRole } from '../types';

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

function UserModal({ user, onClose, onSave }: {
  user: Partial<User> | null;
  onClose: () => void;
  onSave: (u: Partial<User>) => void;
}) {
  const [form, setForm] = useState<Partial<User>>(user || {
    name: '', email: '', phone: '', role: 'receptionist', active: true, specialty: ''
  });

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
              <label className="text-sm font-medium mb-1 block">To'liq ism *</label>
              <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ism familiya" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email *</label>
              <input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@clinic.uz" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Telefon</label>
              <input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+998901234567" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Rol *</label>
              <select value={form.role || 'receptionist'} onChange={e => setForm({ ...form, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="admin">Admin</option>
                <option value="doctor">Shifokor</option>
                <option value="nurse">Hamshira</option>
                <option value="receptionist">Registrator</option>
                <option value="accountant">Buxgalter</option>
              </select>
            </div>
            {(form.role === 'doctor') && (
              <div>
                <label className="text-sm font-medium mb-1 block">Mutaxassislik</label>
                <input value={form.specialty || ''} onChange={e => setForm({ ...form, specialty: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Terapevt" />
              </div>
            )}
            {!user?.id && (
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Parol *</label>
                <input type="password" placeholder="Boshlang'ich parol"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
            <div className="col-span-2 flex items-center gap-3">
              <label className="text-sm font-medium">Faollik:</label>
              <button onClick={() => setForm({ ...form, active: !form.active })}
                className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors ${form.active ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm text-muted-foreground">{form.active ? 'Faol' : 'Nofaol'}</span>
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

export function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<Partial<User> | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'permissions'>('list');

  const handleSave = (form: Partial<User>) => {
    if (form.id) {
      setUsers(prev => prev.map(u => u.id === form.id ? { ...u, ...form } as User : u));
    } else {
      setUsers(prev => [...prev, { ...form as User, id: String(Date.now()), createdAt: '2026-04-03' }]);
    }
    setShowModal(false);
    setEditUser(null);
  };

  const toggleActive = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  const handleDelete = (id: string) => {
    if (confirm('Foydalanuvchini o\'chirishni tasdiqlaysizmi?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-4">
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
                  {users.filter(u => u.role === role).length}
                </div>
                <div className="text-xs text-muted-foreground">{getStatusLabel(role)}</div>
              </div>
            ))}
          </div>

          {/* User cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => (
              <div key={user.id} className={`bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm p-5 transition-all hover:shadow-md ${!user.active ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full ${roleAvatarColors[user.role]} flex items-center justify-center text-white font-semibold`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleActive(user.id)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                      {user.active ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} className="text-gray-400" />}
                    </button>
                    <button onClick={() => { setEditUser(user); setShowModal(true); }} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                      <Edit size={15} />
                    </button>
                    {user.role !== 'admin' && (
                      <button onClick={() => handleDelete(user.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-500">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                    {getStatusLabel(user.role)}
                  </span>
                  {user.specialty && (
                    <span className="text-xs text-muted-foreground">{user.specialty}</span>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">{user.phone}</div>
                  <div className="flex gap-2">
                    <button title="Ruxsatlar" className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                      <Shield size={14} />
                    </button>
                    <button title="Parolni tiklash" className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                      <Key size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                      <span className={`px-2 py-0.5 rounded-full ${roleColors[role]}`}>{getStatusLabel(role)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissions).map(([perm, roles]) => (
                  <tr key={perm} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 text-sm text-foreground">{perm}</td>
                    {(['admin', 'doctor', 'nurse', 'receptionist', 'accountant'] as UserRole[]).map(role => (
                      <td key={role} className="px-4 py-3 text-center">
                        {roles.includes(role) ? (
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
          onClose={() => { setShowModal(false); setEditUser(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
