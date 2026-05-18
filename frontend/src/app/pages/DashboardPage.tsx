import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, Calendar, CreditCard, BedDouble, Clock,
  AlertCircle, CheckCircle, Stethoscope, Building2,
  TrendingUp, ArrowUpRight, UserCheck, ShieldAlert,
} from 'lucide-react';
import { dashboardApi, DashboardPeriod, DashboardMetrics } from '../api/dashboard.service';
import { api } from '../api/client';
import { toast } from 'sonner';

function formatCurrency(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M so'm`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K so'm`;
  return `${v.toLocaleString('uz-UZ')} so'm`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today: 'Bugun',
  week: 'Hafta',
  month: 'Oy',
  year: 'Yil',
};

const ROOM_COLORS: Record<string, string> = {
  available: '#10b981',
  occupied: '#f59e0b',
  maintenance: '#ef4444',
  closed: '#6b7280',
};

const ROOM_LABELS: Record<string, string> = {
  available: 'Bo\'sh',
  occupied: 'Band',
  maintenance: 'Ta\'mirda',
  closed: 'Yopiq',
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  sub?: string;
  subColor?: string;
}

function StatCard({ label, value, icon, iconBg, sub, subColor }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
        {sub && <div className={`text-xs mt-1 ${subColor || 'text-muted-foreground'}`}>{sub}</div>}
      </div>
    </div>
  );
}

function AlertCard({ label, value, icon, bg, textColor }: {
  label: string; value: number; icon: React.ReactNode; bg: string; textColor: string;
}) {
  return (
    <div className={`rounded-2xl p-4 border ${bg} flex items-center gap-4`}>
      <div className={`${textColor}`}>{icon}</div>
      <div>
        <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<DashboardPeriod>('month');
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [todayAlerts, setTodayAlerts] = useState<DashboardMetrics['alerts'] | null>(null);
  const [clientStats, setClientStats] = useState<any>(null);
  const [roomStats, setRoomStats] = useState<any>(null);
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [extraStats, setExtraStats] = useState({ services: 0, departments: 0 });

  const loadDashboard = async (p: DashboardPeriod) => {
    setLoading(true);
    try {
      const [metricsRes, todayRes, clientRes, roomRes, visitsRes, servicesRes, deptsRes] =
        await Promise.all([
          dashboardApi.getMetrics(p) as any,
          dashboardApi.getMetrics('today') as any,
          api.get<any>('/clients/stats', true),
          api.get<any>('/rooms/stats', true),
          api.get<any>('/visits?limit=6&sortBy=visit_date&sortOrder=desc', true),
          api.get<any>('/services?limit=1&status=ACTIVE', true),
          api.get<any>('/departments?limit=1&status=ACTIVE', true),
        ]);

      if (metricsRes?.success) setMetrics(metricsRes.data);
      if (todayRes?.success) setTodayAlerts(todayRes.data?.alerts);
      if (clientRes?.success) setClientStats(clientRes.data);
      if (roomRes?.success) setRoomStats(roomRes.data);

      const visits = visitsRes?.data || [];
      setRecentVisits(Array.isArray(visits) ? visits : []);

      setExtraStats({
        services: servicesRes?.pagination?.total ?? 0,
        departments: deptsRes?.pagination?.total ?? 0,
      });
    } catch (e: any) {
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(period); }, [period]);

  const kpis = metrics?.kpis;
  const alerts = todayAlerts;

  // Room pie data
  const roomPieData = roomStats ? [
    { name: ROOM_LABELS.available, value: roomStats.available, key: 'available' },
    { name: ROOM_LABELS.occupied, value: roomStats.occupied, key: 'occupied' },
    { name: ROOM_LABELS.maintenance, value: roomStats.maintenance, key: 'maintenance' },
    { name: ROOM_LABELS.closed, value: roomStats.closed, key: 'closed' },
  ].filter(d => d.value > 0) : [];

  // Visit trend chart data
  const trendData = (metrics?.charts?.visitTrend || []).map((p: any) => ({
    date: formatDate(p.date),
    tashriflar: p.count,
    daromad: Math.round(p.revenue / 1000),
  }));

  const visitStatusColor: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700',
    DONE: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
    NO_SHOW: 'bg-gray-100 text-gray-600',
  };

  const visitStatusLabel: Record<string, string> = {
    SCHEDULED: 'Kutmoqda',
    IN_PROGRESS: 'Jarayonda',
    COMPLETED: 'Yakunlangan',
    DONE: 'Bajarilgan',
    CANCELLED: 'Bekor',
    NO_SHOW: 'Kelmadi',
  };

  return (
    <div className="space-y-5">

      {/* Period selector */}
      <div className="flex items-center gap-2">
        {(Object.keys(PERIOD_LABELS) as DashboardPeriod[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              period === p
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 border border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
        {loading && (
          <span className="text-xs text-muted-foreground ml-2">Yuklanmoqda...</span>
        )}
      </div>

      {/* Main KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Jami tashriflar"
          value={kpis?.totalVisits ?? '—'}
          icon={<Calendar size={20} className="text-blue-600" />}
          iconBg="bg-blue-50 dark:bg-blue-900/30"
          sub={`${kpis?.completedVisits ?? 0} ta bajarilgan`}
        />
        <StatCard
          label="Jami mijozlar"
          value={kpis?.totalClients ?? '—'}
          icon={<Users size={20} className="text-green-600" />}
          iconBg="bg-green-50 dark:bg-green-900/30"
          sub={`+${kpis?.newClients ?? 0} yangi`}
          subColor="text-green-600"
        />
        <StatCard
          label="Daromad"
          value={kpis ? formatCurrency(kpis.totalRevenue) : '—'}
          icon={<CreditCard size={20} className="text-amber-600" />}
          iconBg="bg-amber-50 dark:bg-amber-900/30"
          sub={`O'rtacha: ${kpis ? formatCurrency(kpis.averageCheck) : '—'}`}
        />
        <StatCard
          label="Qarzdorlik"
          value={kpis ? `${kpis.debtRate}%` : '—'}
          icon={<ShieldAlert size={20} className="text-red-600" />}
          iconBg="bg-red-50 dark:bg-red-900/30"
          sub={`${clientStats?.debt ?? 0} ta qarzdor mijoz`}
          subColor="text-red-500"
        />
      </div>

      {/* Today's alerts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AlertCard
          label="Bugungi rejalashtirilgan"
          value={alerts?.scheduledVisits ?? 0}
          icon={<Clock size={22} />}
          bg="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900"
          textColor="text-blue-600"
        />
        <AlertCard
          label="Qarzdor mijozlar"
          value={alerts?.debtClients ?? 0}
          icon={<AlertCircle size={22} />}
          bg="bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900"
          textColor="text-red-600"
        />
        <AlertCard
          label="Bo'sh xonalar"
          value={alerts?.availableRooms ?? 0}
          icon={<BedDouble size={22} />}
          bg="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900"
          textColor="text-green-600"
        />
        <AlertCard
          label="To'lanmagan tashriflar"
          value={alerts?.pendingPayments ?? 0}
          icon={<TrendingUp size={22} />}
          bg="bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900"
          textColor="text-amber-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Visit trend */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">Tashriflar dinamikasi</h3>
            <p className="text-xs text-muted-foreground">{PERIOD_LABELS[period]} davomida</p>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(trendData.length / 8)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val: number, name: string) =>
                  name === 'daromad' ? [`${val}K so'm`, 'Daromad'] : [val, 'Tashriflar']
                } />
                <Line type="monotone" dataKey="tashriflar" stroke="#3b82f6" strokeWidth={2} dot={false} name="Tashriflar" />
                <Line type="monotone" dataKey="daromad" stroke="#10b981" strokeWidth={2} dot={false} name="Daromad" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              {loading ? 'Yuklanmoqda...' : 'Ma\'lumot yo\'q'}
            </div>
          )}
        </div>

        {/* Rooms status */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <div className="mb-3">
            <h3 className="font-semibold text-foreground">Xonalar holati</h3>
            <p className="text-xs text-muted-foreground">Jami {roomStats?.total ?? 0} ta xona</p>
          </div>
          {roomPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={roomPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {roomPieData.map((entry) => (
                      <Cell key={entry.key} fill={ROOM_COLORS[entry.key]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number, name: string) => [val, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {roomPieData.map(item => (
                  <div key={item.key} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: ROOM_COLORS[item.key] }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{item.value} ta</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">
              {loading ? 'Yuklanmoqda...' : 'Xonalar yo\'q'}
            </div>
          )}
        </div>
      </div>

      {/* Stats row: Clients breakdown + Staff stats */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Client breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Mijozlar taqsimoti</h3>
          {clientStats ? (
            <div className="space-y-3">
              {[
                { label: 'Faol mijozlar', value: clientStats.active, total: clientStats.total, color: '#10b981' },
                { label: 'Erkak', value: clientStats.male, total: clientStats.total, color: '#3b82f6' },
                { label: 'Ayol', value: clientStats.female, total: clientStats.total, color: '#ec4899' },
                { label: 'Qarzdor', value: clientStats.debt, total: clientStats.total, color: '#ef4444' },
                { label: 'Nofaol', value: clientStats.inactive, total: clientStats.total, color: '#6b7280' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">
                      {item.value} <span className="text-muted-foreground">/ {item.total}</span>
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: item.total > 0 ? `${Math.min((item.value / item.total) * 100, 100)}%` : '0%',
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">Yuklanmoqda...</div>
          )}
        </div>

        {/* Staff & services stats */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <h3 className="font-semibold text-foreground mb-4">Klinika ko'rsatkichlari</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'Shifokorlar',
                value: kpis?.totalDoctors ?? '—',
                icon: <UserCheck size={20} className="text-blue-600" />,
                bg: 'bg-blue-50 dark:bg-blue-900/20',
              },
              {
                label: 'Faol xizmatlar',
                value: extraStats.services,
                icon: <Stethoscope size={20} className="text-purple-600" />,
                bg: 'bg-purple-50 dark:bg-purple-900/20',
              },
              {
                label: 'Bo\'limlar',
                value: extraStats.departments,
                icon: <Building2 size={20} className="text-teal-600" />,
                bg: 'bg-teal-50 dark:bg-teal-900/20',
              },
              {
                label: 'Xona bandligi',
                value: kpis ? `${kpis.occupancyRate}%` : '—',
                icon: <BedDouble size={20} className="text-amber-600" />,
                bg: 'bg-amber-50 dark:bg-amber-900/20',
              },
              {
                label: 'Qayta kelish',
                value: kpis ? `${kpis.retentionRate}%` : '—',
                icon: <ArrowUpRight size={20} className="text-green-600" />,
                bg: 'bg-green-50 dark:bg-green-900/20',
              },
              {
                label: 'Bajarilgan',
                value: kpis?.completedVisits ?? '—',
                icon: <CheckCircle size={20} className="text-emerald-600" />,
                bg: 'bg-emerald-50 dark:bg-emerald-900/20',
              },
            ].map(item => (
              <div key={item.label} className={`rounded-xl p-3 ${item.bg} flex items-center gap-3`}>
                {item.icon}
                <div>
                  <div className="text-lg font-bold text-foreground">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent visits */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground">So'nggi tashriflar</h3>
            <p className="text-xs text-muted-foreground">Eng oxirgi 6 ta</p>
          </div>
          <button
            onClick={() => navigate('/visits')}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Barchasini ko'rish →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Bemor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Shifokor</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Sana</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Summa</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Qarz</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Holat</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">Yuklanmoqda...</td></tr>
              ) : recentVisits.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">Tashriflar yo'q</td></tr>
              ) : (
                recentVisits.map((visit: any) => (
                  <tr key={visit.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 text-xs font-semibold flex-shrink-0">
                          {(visit.client?.full_name || '?').charAt(0)}
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[120px]">
                          {visit.client?.full_name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {visit.doctor?.full_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {visit.visit_date ? formatDate(visit.visit_date) : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {formatCurrency(Number(visit.total_amount || 0))}
                    </td>
                    <td className="px-4 py-3">
                      {Number(visit.debt_amount) > 0 ? (
                        <span className="text-red-500 font-medium text-sm">
                          {formatCurrency(Number(visit.debt_amount))}
                        </span>
                      ) : (
                        <span className="text-green-600 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${visitStatusColor[visit.status] || 'bg-gray-100 text-gray-600'}`}>
                        {visitStatusLabel[visit.status] || visit.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
