import { useState } from 'react';
import { Save, Building2, User, Shield, Database, Bell, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getStatusLabel } from '../mockData';

type Tab = 'profile' | 'clinic' | 'notifications' | 'security' | 'appearance' | 'backup';

const tabs = [
  { id: 'profile' as Tab, label: 'Profil', icon: <User size={16} /> },
  { id: 'clinic' as Tab, label: 'Klinika', icon: <Building2 size={16} /> },
  { id: 'notifications' as Tab, label: 'Bildirishnomalar', icon: <Bell size={16} /> },
  { id: 'security' as Tab, label: 'Xavfsizlik', icon: <Shield size={16} /> },
  { id: 'appearance' as Tab, label: 'Ko\'rinish', icon: <Palette size={16} /> },
  { id: 'backup' as Tab, label: 'Zaxira', icon: <Database size={16} /> },
];

function FormField({ label, type = 'text', value, onChange, placeholder }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block text-foreground">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }: {
  label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {desc && <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>}
      </div>
      <button onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}>
        <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);
  const { currentUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '', email: currentUser?.email || '',
    phone: currentUser?.phone || '', specialty: currentUser?.specialty || ''
  });

  const [clinicForm, setClinicForm] = useState({
    name: 'MedClinic', address: 'Toshkent, Yunusobod tumani',
    phone: '+998712345678', email: 'info@medclinic.uz',
    workStart: '08:00', workEnd: '18:00',
    website: 'www.medclinic.uz', tin: '123456789'
  });

  const [notifications, setNotifications] = useState({
    visitReminder: true,
    newClient: true,
    paymentAlert: true,
    debtAlert: false,
    smsNotif: false,
    emailNotif: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
    ipRestriction: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {currentUser?.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-foreground">{currentUser?.name}</div>
                <div className="text-sm text-muted-foreground">{getStatusLabel(currentUser?.role || '')}</div>
                <button className="text-xs text-blue-600 hover:underline mt-1">Rasmni o'zgartirish</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="To'liq ism" value={profileForm.name} onChange={v => setProfileForm({...profileForm, name: v})} />
              <FormField label="Email" type="email" value={profileForm.email} onChange={v => setProfileForm({...profileForm, email: v})} />
              <FormField label="Telefon" value={profileForm.phone} onChange={v => setProfileForm({...profileForm, phone: v})} />
              <FormField label="Mutaxassislik" value={profileForm.specialty} onChange={v => setProfileForm({...profileForm, specialty: v})} placeholder="Mas. Terapevt" />
            </div>
          </div>
        );

      case 'clinic':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Klinika nomi" value={clinicForm.name} onChange={v => setClinicForm({...clinicForm, name: v})} />
              <FormField label="INN" value={clinicForm.tin} onChange={v => setClinicForm({...clinicForm, tin: v})} />
              <div className="sm:col-span-2">
                <FormField label="Manzil" value={clinicForm.address} onChange={v => setClinicForm({...clinicForm, address: v})} />
              </div>
              <FormField label="Telefon" value={clinicForm.phone} onChange={v => setClinicForm({...clinicForm, phone: v})} />
              <FormField label="Email" type="email" value={clinicForm.email} onChange={v => setClinicForm({...clinicForm, email: v})} />
              <FormField label="Veb-sayt" value={clinicForm.website} onChange={v => setClinicForm({...clinicForm, website: v})} />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Ish boshlanishi</label>
                  <input type="time" value={clinicForm.workStart} onChange={e => setClinicForm({...clinicForm, workStart: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Ish tugashi</label>
                  <input type="time" value={clinicForm.workEnd} onChange={e => setClinicForm({...clinicForm, workEnd: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-0">
            <Toggle label="Tashrif eslatmasi" desc="Tashrif vaqtidan 1 soat oldin xabar" checked={notifications.visitReminder} onChange={v => setNotifications({...notifications, visitReminder: v})} />
            <Toggle label="Yangi mijoz" desc="Yangi mijoz qo'shilganda xabar" checked={notifications.newClient} onChange={v => setNotifications({...notifications, newClient: v})} />
            <Toggle label="To'lov bildirishnomasi" desc="Yangi to'lov qabul qilinganda" checked={notifications.paymentAlert} onChange={v => setNotifications({...notifications, paymentAlert: v})} />
            <Toggle label="Qarz ogohlantirish" desc="Qarzkor mijozlar haqida kunlik xabar" checked={notifications.debtAlert} onChange={v => setNotifications({...notifications, debtAlert: v})} />
            <Toggle label="SMS bildirishnomalar" desc="Mobil telefonga xabar yuborish" checked={notifications.smsNotif} onChange={v => setNotifications({...notifications, smsNotif: v})} />
            <Toggle label="Email bildirishnomalar" desc="Email orqali kunlik hisobot" checked={notifications.emailNotif} onChange={v => setNotifications({...notifications, emailNotif: v})} />
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <Toggle label="Ikki faktorli autentifikatsiya" desc="SMS orqali qo'shimcha tasdiqlash" checked={security.twoFactor} onChange={v => setSecurity({...security, twoFactor: v})} />
            <Toggle label="IP cheklash" desc="Faqat ruxsat etilgan IP manzillardan kirish" checked={security.ipRestriction} onChange={v => setSecurity({...security, ipRestriction: v})} />
            <div>
              <label className="text-sm font-medium mb-1 block">Sessiya muddati (daqiqa)</label>
              <select value={security.sessionTimeout} onChange={e => setSecurity({...security, sessionTimeout: e.target.value})}
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="15">15 daqiqa</option>
                <option value="30">30 daqiqa</option>
                <option value="60">1 soat</option>
                <option value="120">2 soat</option>
              </select>
            </div>
            <div className="p-4 bg-muted/30 rounded-xl">
              <div className="font-medium text-sm mb-1">Parolni o'zgartirish</div>
              <div className="space-y-3">
                <input type="password" placeholder="Joriy parol" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="password" placeholder="Yangi parol" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="password" placeholder="Yangi parolni tasdiqlang" className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors">
                  Parolni yangilash
                </button>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block">Rang sxemasi</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Moviy (standart)', color: '#3b82f6' },
                  { name: 'Yashil', color: '#10b981' },
                  { name: 'Binafsha', color: '#8b5cf6' },
                ].map(theme => (
                  <button key={theme.name} className="flex items-center gap-2 p-3 border border-border rounded-xl hover:bg-muted transition-colors">
                    <div className="w-5 h-5 rounded-full" style={{ background: theme.color }}></div>
                    <span className="text-xs text-muted-foreground">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-3 block">Til</label>
              <select className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="uz">O'zbek tili</option>
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-3 block">Valyuta formati</label>
              <select className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>UZS (so'm)</option>
                <option>USD ($)</option>
              </select>
            </div>
          </div>
        );

      case 'backup':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-400">So'nggi zaxira</div>
              <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">2026-04-03 02:00 - Avtomatik</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 p-4 border border-border rounded-xl hover:bg-muted transition-colors">
                <Database size={20} className="text-blue-600" />
                <div className="text-left">
                  <div className="text-sm font-medium">Zaxira yaratish</div>
                  <div className="text-xs text-muted-foreground">Ma'lumotlarni saqlash</div>
                </div>
              </button>
              <button className="flex items-center justify-center gap-2 p-4 border border-border rounded-xl hover:bg-muted transition-colors">
                <Database size={20} className="text-green-600" />
                <div className="text-left">
                  <div className="text-sm font-medium">Tiklash</div>
                  <div className="text-xs text-muted-foreground">Zaxiradan yuklash</div>
                </div>
              </button>
            </div>
            <div>
              <div className="font-medium text-sm mb-3">Zaxira jadvali</div>
              <div className="space-y-2">
                {[
                  { date: '2026-04-03 02:00', size: '4.2 MB', type: 'Avtomatik' },
                  { date: '2026-04-02 02:00', size: '4.1 MB', type: 'Avtomatik' },
                  { date: '2026-04-01 14:30', size: '4.0 MB', type: 'Qo\'lda' },
                ].map((backup, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div>
                      <div className="text-sm text-foreground">{backup.date}</div>
                      <div className="text-xs text-muted-foreground">{backup.type} · {backup.size}</div>
                    </div>
                    <button className="text-xs text-blue-600 hover:underline">Tiklash</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Tabs */}
        <div className="sm:w-48 flex-shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-2 space-y-0.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-foreground">{tabs.find(t => t.id === activeTab)?.label}</h3>
            </div>
            {renderContent()}
            <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium"
              >
                <Save size={16} />
                {saved ? 'Saqlandi ✓' : 'Saqlash'}
              </button>
              <button className="px-5 py-2.5 border border-border rounded-xl text-sm hover:bg-muted transition-colors">
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
