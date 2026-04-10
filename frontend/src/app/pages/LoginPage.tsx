import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEY = 'login_form_data';

export function LoginPage() {
  const navigate = useNavigate();

  // LocalStorage dan saqlangan ma'lumotlarni olish
  const [savedData, setSavedData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { loginInput: '', password: '' };
    } catch {
      return { loginInput: '', password: '' };
    }
  });

  const [loginInput, setLoginInput] = useState(savedData.loginInput || '');
  const [password, setPassword] = useState(savedData.password || '');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { login, isLoading } = useAuth();

  // Inputlar o'zgarganda localStorage ga saqlash
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ loginInput, password }));
  }, [loginInput, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasError(false);
    const success = await login(loginInput, password);
    if (success) {
      // Muvaffaqiyatli bo'lsa, saqlangan ma'lumotni tozalash
      localStorage.removeItem(STORAGE_KEY);
      navigate('/dashboard');
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-white"></div>
          <div className="absolute top-40 left-40 w-40 h-40 rounded-full border border-white"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full border-2 border-white"></div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Building2 size={22} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">MedClinic</div>
              <div className="text-blue-200 text-xs">Boshqaruv tizimi</div>
            </div>
          </div>

          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Zamonaviy klinika<br />boshqaruvi
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Bemorlarni, tashriflarni, to'lovlarni va barcha tibbiy jarayonlarni
            bir joydan boshqaring.
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-4">
          {[
            { label: 'Bemorlar', value: '1,240+', icon: '👥' },
            { label: 'Bugungi tashriflar', value: '45', icon: '📅' },
            { label: 'Shifokorlar', value: '12', icon: '🩺' },
            { label: 'Oylik daromad', value: '68M so\'m', icon: '💰' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-white font-bold text-lg">{stat.value}</div>
              <div className="text-blue-200 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-foreground">MedClinic</div>
              <div className="text-xs text-muted-foreground">Boshqaruv tizimi</div>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Xush kelibsiz!</h1>
            <p className="text-muted-foreground text-sm">Hisobingizga kirish uchun ma'lumotlaringizni kiriting</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Login</label>
              <input
                type="text"
                value={loginInput}
                onChange={e => setLoginInput(e.target.value)}
                placeholder="Login"
                className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm ${
                  hasError
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-border focus:ring-blue-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Parol</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Parol"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm pr-12 ${
                    hasError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-border text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground">Meni eslab qol</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Kirish...</span>
                </>
              ) : (
                'Kirish'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
