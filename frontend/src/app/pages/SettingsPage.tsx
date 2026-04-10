import { useState, useEffect, useRef } from 'react';
import { Save, Building2, User, Bell, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

type Tab = 'profile' | 'clinic' | 'notifications';

const tabs = [
  { id: 'profile' as Tab, label: 'Profil', icon: <User size={16} /> },
  { id: 'clinic' as Tab, label: 'Klinika', icon: <Building2 size={16} /> },
  { id: 'notifications' as Tab, label: 'Bildirishnomalar', icon: <Bell size={16} /> },
];

function FormField({ label, type = 'text', value, onChange, placeholder, disabled }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
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
  const [isSaving, setIsSaving] = useState(false);
  const { currentUser, updateProfile, changePassword } = useAuth();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    login: '',
    role: '',
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // Clinic form
  const [clinicForm, setClinicForm] = useState({
    name: 'MedClinic', address: 'Toshkent, Yunusobod tumani',
    phone: '+998712345678', email: 'info@medclinic.uz',
    workStart: '08:00', workEnd: '18:00',
    website: 'www.medclinic.uz', tin: '123456789'
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    visitReminder: true,
    newClient: true,
    paymentAlert: true,
    debtAlert: false,
    smsNotif: false,
    emailNotif: true,
  });

  // Current user o'zgarganda form ni yangilash (faqat birinchi marta)
  const isInitialized = useRef(false);
  useEffect(() => {
    if (currentUser && !isInitialized.current) {
      isInitialized.current = true;
      setProfileForm({
        full_name: currentUser.fullName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        login: currentUser.login || '',
        role: currentUser.role?.name || '',
      });
    }
  }, [currentUser]);

  // Profil saqlash
  const handleSave = async () => {
    if (activeTab === 'profile') {
      setIsSaving(true);
      try {
        // Faqat to'ldirilgan maydonlarni yuborish (bo'shlarni yubormaslik)
        const updateData: { full_name?: string; email?: string; phone?: string } = {};
        
        if (profileForm.full_name?.trim()) {
          updateData.full_name = profileForm.full_name.trim();
        }
        if (profileForm.email?.trim()) {
          updateData.email = profileForm.email.trim();
        }
        if (profileForm.phone?.trim()) {
          updateData.phone = profileForm.phone.trim();
        }

        // Agar hech narsa to'ldirilmagan bo'lsa va parol ham yo'q bo'lsa
        const hasProfileChanges = Object.keys(updateData).length > 0;
        const hasPasswordChanges = passwordForm.oldPassword || passwordForm.newPassword || passwordForm.confirmPassword;

        if (!hasProfileChanges && !hasPasswordChanges) {
          toast.info('O\'zgartirish uchun ma\'lumot kiriting');
          setIsSaving(false);
          return;
        }

        // Profil ma'lumotlarini yangilash
        if (hasProfileChanges) {
          await updateProfile(updateData);
        }

        // Agar parol maydonlari to'ldirilgan bo'lsa, parolni ham o'zgartirish
        if (passwordForm.oldPassword || passwordForm.newPassword || passwordForm.confirmPassword) {
          if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            toast.error('Parolni o\'zgartirish uchun barcha maydonlarni to\'ldiring');
            return;
          }
          if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Yangi parollar mos kelmadi');
            return;
          }
          // Backend validatsiyasi: 3+ belgi
          if (passwordForm.newPassword.length <= 3) {
            toast.error('Parol kamida 3 belgidan ko\'p bo\'lishi kerak');
            return;
          }

          await changePassword(passwordForm.oldPassword, passwordForm.newPassword);
          setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        }
      } catch (error: any) {
        console.error('Profile update error - FULL:', JSON.stringify(error, null, 2));
        console.error('Profile update error - data:', error?.data);
        console.error('Profile update error - message:', error?.message);
        
        // Backend xato formatini to'g'ri o'qish (validation errors array bo'lishi mumkin)
        const errorData = error?.data;
        let errorMessage = 'Xatolik yuz berdi';
        
        if (errorData?.message) {
          if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(', ');
          } else {
            errorMessage = errorData.message;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
      } finally {
        setIsSaving(false);
      }
    } else {
      toast.info('Bu sozlama hozircha ishga tushmagan');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Avatar section */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {currentUser?.fullName?.charAt(0) || currentUser?.login?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="font-semibold text-foreground">{currentUser?.fullName || currentUser?.login}</div>
                <div className="text-sm text-muted-foreground">{currentUser?.role?.name}</div>
              </div>
            </div>

            {/* Profile form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="To'liq ism"
                value={profileForm.full_name}
                onChange={v => setProfileForm({...profileForm, full_name: v})}
                placeholder="Ism Familiya"
              />
              <FormField
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={v => setProfileForm({...profileForm, email: v})}
                placeholder="email@example.com"
              />
              <FormField
                label="Telefon"
                value={profileForm.phone}
                onChange={v => setProfileForm({...profileForm, phone: v})}
                placeholder="+998901234567"
              />
              <FormField
                label="Login"
                value={profileForm.login}
                onChange={() => {}}
                disabled
              />
              <FormField
                label="Rol"
                value={profileForm.role}
                onChange={() => {}}
                disabled
              />
            </div>

            {/* Password change section */}
            <div className="border-t border-border pt-6">
              <div className="font-medium text-sm mb-3">Parolni o'zgartirish</div>
              <div className="space-y-3">
                {/* Joriy parol */}
                <div className="relative">
                  <input
                    type={showPasswords.old ? 'text' : 'password'}
                    placeholder="Joriy parol"
                    value={passwordForm.oldPassword}
                    onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                    className="w-full px-3 py-2 pr-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, old: !showPasswords.old})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPasswords.old ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Yangi parol */}
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    placeholder="Yangi parol"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full px-3 py-2 pr-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Tasdiqlash */}
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    placeholder="Yangi parolni tasdiqlang"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 pr-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
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
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saqlanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Saqlash</span>
                  </>
                )}
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
