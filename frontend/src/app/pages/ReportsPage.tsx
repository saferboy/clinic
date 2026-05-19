import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Download, RefreshCw, Calendar, TrendingUp, TrendingDown,
  Users, DollarSign, Activity, Home, Star, AlertTriangle,
  Gift, Megaphone, RotateCcw, Stethoscope,
} from 'lucide-react';
import { reportsApi } from '../api/reports.service';
import { toast } from 'sonner';

type ReportTab =
  | 'daily' | 'monthly' | 'finance' | 'doctor'
  | 'service' | 'room' | 'client' | 'debt'
  | 'marketing' | 'returning' | 'birthday';

const TABS: { id: ReportTab; label: string; icon: React.ReactNode }[] = [
  { id: 'daily',     label: 'Kunlik',         icon: <Calendar size={15} /> },
  { id: 'monthly',   label: 'Oylik',           icon: <Activity size={15} /> },
  { id: 'finance',   label: 'Moliya',          icon: <DollarSign size={15} /> },
  { id: 'doctor',    label: 'Shifokorlar',     icon: <Stethoscope size={15} /> },
  { id: 'service',   label: 'Xizmatlar',       icon: <Star size={15} /> },
  { id: 'room',      label: 'Xonalar',         icon: <Home size={15} /> },
  { id: 'client',    label: 'Mijozlar',        icon: <Users size={15} /> },
  { id: 'debt',      label: 'Qarzlar',         icon: <AlertTriangle size={15} /> },
  { id: 'marketing', label: 'Marketing',       icon: <Megaphone size={15} /> },
  { id: 'returning', label: 'Qaytuvchilar',    icon: <RotateCcw size={15} /> },
  { id: 'birthday',  label: "Tug'ilgan kun",  icon: <Gift size={15} /> },
];

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];

function fmt(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toLocaleString('uz-UZ');
}
function fmtS(v: number) { return `${fmt(v)} so'm`; }

function KpiCard({ label, value, sub, color = 'blue', trend }: {
  label: string; value: string | number; sub?: string; color?: string; trend?: number;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
  };
  return (
    <div className={`rounded-xl p-4 border border-border bg-white dark:bg-slate-800`}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-xl font-bold ${colors[color]?.split(' ').slice(2).join(' ') || 'text-foreground'}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
      <RefreshCw size={16} className="animate-spin mr-2" /> Yuklanmoqda...
    </div>
  );
}

function Empty() {
  return (
    <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
      Ma'lumot topilmadi
    </div>
  );
}

export function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>('daily');
  const [loading, setLoading] = useState(false);

  // Date state
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [dailyDate, setDailyDate] = useState(today);
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [birthdayDays, setBirthdayDays] = useState(30);

  // Data state
  const [dailyData, setDailyData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [serviceData, setServiceData] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [debtData, setDebtData] = useState<any>(null);
  const [marketingData, setMarketingData] = useState<any>(null);
  const [birthdayData, setBirthdayData] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'daily') {
        const r = await reportsApi.getDaily(dailyDate);
        if (r.success) setDailyData(r.data);
      } else if (tab === 'monthly' || tab === 'finance' || tab === 'room' || tab === 'returning') {
        const r = await reportsApi.getMonthly(monthlyMonth, monthlyYear, true);
        if (r.success) setMonthlyData(r.data);
      } else if (tab === 'doctor') {
        const r = await reportsApi.getDoctorRanking(startDate, endDate);
        if (r.success) setDoctorData(r.data);
      } else if (tab === 'service') {
        const r = await reportsApi.getServiceReport(startDate, endDate);
        if (r.success) setServiceData(r.data);
      } else if (tab === 'client') {
        const r = await reportsApi.getClientList(startDate, endDate);
        if (r.success) setClientData(r.data);
      } else if (tab === 'debt') {
        const r = await reportsApi.getDebtReport(startDate, endDate);
        if (r.success) setDebtData(r.data);
      } else if (tab === 'marketing') {
        const r = await reportsApi.getReferralReport(startDate, endDate);
        if (r.success) setMarketingData(r.data);
      } else if (tab === 'birthday') {
        const r = await reportsApi.getBirthdayReport(birthdayDays);
        if (r.success) setBirthdayData(r.data);
      }
    } catch {
      toast.error('Ma\'lumot yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, [tab, dailyDate, startDate, endDate, monthlyMonth, monthlyYear, birthdayDays]);

  useEffect(() => { load(); }, [load]);

  // ---- Renderers ----

  function renderDaily() {
    const d = dailyData;
    if (!d) return <Empty />;
    const vs = d.visitStats;
    const fs = d.financialStats;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard label="Jami tashriflar" value={vs.totalVisits} color="blue" />
          <KpiCard label="Yakunlangan" value={vs.completedVisits} color="green" />
          <KpiCard label="Bugungi daromad" value={fmtS(fs.totalIncome)} color="purple" />
          <KpiCard label="Qarz" value={fmtS(fs.totalDebt)} color="red" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
            <h4 className="font-medium mb-3 text-sm">Tashriflar holati</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={[
                  { name: 'Yakunlangan', value: vs.completedVisits },
                  { name: 'Rejalashtirilgan', value: vs.scheduledVisits },
                  { name: 'Jarayonda', value: vs.inProgressVisits },
                  { name: 'Bekor', value: vs.cancelledVisits },
                  { name: "Kelmagan", value: vs.noShowVisits },
                ].filter(i => i.value > 0)} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
            <h4 className="font-medium mb-3 text-sm">Shifokorlar yuki</h4>
            {d.doctorLoadStats?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={d.doctorLoadStats.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="doctorName" type="category" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `${v} ta`} />
                  <Bar dataKey="visitCount" name="Tashriflar" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
          <h4 className="font-medium mb-3 text-sm">Xona bandligi</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{d.roomOccupancyStats?.usedRooms}</div>
              <div className="text-xs text-muted-foreground">Ishlatilgan xonalar</div>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{d.roomOccupancyStats?.totalRooms}</div>
              <div className="text-xs text-muted-foreground">Jami xonalar</div>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{d.roomOccupancyStats?.occupancyRate}%</div>
              <div className="text-xs text-muted-foreground">Bandlik darajasi</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderMonthly() {
    const d = monthlyData;
    if (!d) return <Empty />;
    const vs = d.visitStats;
    const fs = d.financialStats;
    const cmp = d.comparison;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard label="Jami tashriflar" value={vs.totalVisits}
            trend={cmp?.visitChange?.changePercent} color="blue" />
          <KpiCard label="Kun boshiga" value={`${vs.averageVisitsPerDay} ta`} color="blue" />
          <KpiCard label="Jami daromad" value={fmtS(fs.totalIncome)}
            trend={cmp?.incomeChange?.changePercent} color="green" />
          <KpiCard label="Sof foyda" value={fmtS(fs.profit)} color="purple"
            sub={`Xarajat: ${fmtS(fs.totalOutcome)}`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
            <h4 className="font-medium mb-3 text-sm">Xizmatlar reytingi</h4>
            {d.serviceStats?.length ? (
              <div className="space-y-2">
                {d.serviceStats.slice(0, 6).map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: COLORS[i % COLORS.length] }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm">
                        <span className="truncate font-medium">{s.serviceName}</span>
                        <span className="text-muted-foreground ml-2 flex-shrink-0">{s.count} ta</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full mt-1">
                        <div className="h-full rounded-full" style={{ width: `${s.percentage}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{s.percentage}%</span>
                  </div>
                ))}
              </div>
            ) : <Empty />}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
            <h4 className="font-medium mb-3 text-sm">Yangi mijozlar manbasi</h4>
            {d.newClientStats?.bySource?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={d.newClientStats.bySource} cx="50%" cy="50%" outerRadius={75}
                    dataKey="count" nameKey="sourceName"
                    label={({ sourceName, count }) => `${sourceName}: ${count}`}>
                    {d.newClientStats.bySource.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <KpiCard label="Yangi mijozlar" value={d.newClientStats?.totalNewClients}
            trend={cmp?.clientChange?.changePercent} color="blue" />
          <KpiCard label="Retention rate" value={`${d.newClientStats?.retentionRate}%`} color="green" />
          <KpiCard label="Qarzdorlik" value={fmtS(d.debtStats?.totalDebt)} color="red"
            sub={`${d.debtStats?.debtRate}% vizitlardan`} />
        </div>
      </div>
    );
  }

  function renderFinance() {
    const d = monthlyData;
    if (!d) return <Empty />;
    const fs = d.financialStats;
    const financeItems = [
      { label: 'Jami daromad', value: fs.totalIncome, color: '#10b981' },
      { label: "To'lovlar", value: fs.totalPayment, color: '#3b82f6' },
      { label: 'Oldindan to\'lov', value: fs.totalPrepaid, color: '#8b5cf6' },
      { label: 'Xarajatlar', value: fs.totalOutcome, color: '#ef4444' },
      { label: 'Qarz', value: fs.totalDebt, color: '#f59e0b' },
    ];
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <KpiCard label="Jami daromad" value={fmtS(fs.totalIncome)} color="green" />
          <KpiCard label="Xarajatlar" value={fmtS(fs.totalOutcome)} color="red" />
          <KpiCard label="Sof foyda" value={fmtS(fs.profit)}
            color={fs.profit >= 0 ? 'blue' : 'red'} />
          <KpiCard label="O'rtacha check" value={fmtS(fs.averageCheck)} color="purple" />
          <KpiCard label="Qarz miqdori" value={fmtS(fs.totalDebt)} color="amber" />
          <KpiCard label="Oldindan to'lov" value={fmtS(fs.totalPrepaid)} color="blue" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
          <h4 className="font-medium mb-4 text-sm">Moliyaviy ko'rsatkichlar</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={financeItems} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={v => `${fmt(v)}`} tick={{ fontSize: 11 }} />
              <YAxis dataKey="label" type="category" width={130} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => fmtS(v)} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {financeItems.map((item, i) => <Cell key={i} fill={item.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {d.debtStats?.debtByAge?.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
            <h4 className="font-medium mb-3 text-sm">Qarz yoshi (aging)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {d.debtStats.debtByAge.map((a: any, i: number) => (
                <div key={i} className="rounded-xl bg-muted/30 p-3 text-center">
                  <div className="text-lg font-bold" style={{ color: COLORS[i] }}>{fmtS(a.amount)}</div>
                  <div className="text-xs text-muted-foreground">{a.age}</div>
                  <div className="text-xs text-muted-foreground">{a.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderDoctor() {
    const rankings = doctorData?.rankings;
    if (!rankings) return <Empty />;
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
          <h4 className="font-medium mb-4 text-sm">Shifokorlar reytingi</h4>
          <ResponsiveContainer width="100%" height={Math.max(200, rankings.length * 40)}>
            <BarChart data={rankings} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="doctorName" type="category" width={130} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="visitCount" name="Tashriflar" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rankings.map((doc: any, i: number) => (
            <div key={doc.doctorId} className="bg-white dark:bg-slate-800 rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: i < 3 ? ['#f59e0b','#9ca3af','#b45309'][i] : COLORS[i % COLORS.length] }}>
                  {i + 1}
                </div>
                <div className="font-medium text-sm truncate">{doc.doctorName}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">Tashriflar</div>
                  <div className="font-semibold text-blue-600">{doc.visitCount}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Daromad</div>
                  <div className="font-semibold text-green-600 text-xs">{fmtS(doc.totalRevenue)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Komissiya</div>
                  <div className="font-semibold text-purple-600 text-xs">{fmtS(doc.commission)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderService() {
    const d = serviceData;
    if (!d) return <Empty />;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard label="Jami xizmatlar" value={d.summary?.totalServices} color="blue" />
          <KpiCard label="Jami daromad" value={fmtS(d.summary?.totalRevenue)} color="green" />
          <KpiCard label="O'rtacha narx" value={fmtS(d.summary?.averagePrice)} color="purple" />
          <KpiCard label="Noyob xizmatlar" value={d.summary?.uniqueServices} color="amber" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
            <h4 className="font-medium mb-3 text-sm">Top xizmatlar (daromad bo'yicha)</h4>
            {d.topServices?.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={d.topServices.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="serviceName" tick={{ fontSize: 10 }} interval={0}
                    angle={-20} textAnchor="end" height={50} />
                  <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => fmtS(v)} />
                  <Bar dataKey="revenue" name="Daromad" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
            <h4 className="font-medium mb-3 text-sm">Bo'limlar bo'yicha</h4>
            {d.byDepartment?.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={d.byDepartment} cx="50%" cy="50%" outerRadius={85}
                    dataKey="revenue" nameKey="departmentName"
                    label={({ departmentName, percentage }) => `${departmentName} ${percentage}%`}>
                    {d.byDepartment.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtS(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
        </div>
      </div>
    );
  }

  function renderRoom() {
    const d = monthlyData;
    if (!d) return <Empty />;
    const ro = d.roomOccupancyStats;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard label="Jami xonalar" value={ro?.totalRooms} color="blue" />
          <KpiCard label="Jami foydalanish" value={ro?.totalUsage} color="green" />
          <KpiCard label="O'rtacha bandlik" value={`${ro?.averageOccupancyRate}%`} color="purple" />
          <KpiCard label="Faol xonalar" value={ro?.roomUsage?.length || 0} color="amber" />
        </div>
        {ro?.roomUsage?.length ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
            <h4 className="font-medium mb-4 text-sm">Xonalar bo'yicha foydalanish</h4>
            <ResponsiveContainer width="100%" height={Math.max(200, ro.roomUsage.length * 40)}>
              <BarChart data={ro.roomUsage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="roomName" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="usageCount" name="Foydalanish" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <Empty />}
      </div>
    );
  }

  function renderClient() {
    const d = clientData;
    if (!d) return <Empty />;
    const clients = d.data || [];
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <KpiCard label="Jami mijozlar" value={d.total || clients.length} color="blue" />
          <KpiCard label="Ko'rsatilgan" value={clients.length} color="green" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border font-medium text-sm">Mijozlar ro'yxati</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Mijoz</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Telefon</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Tashriflar</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Sarflagan</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Balans</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c: any) => (
                  <tr key={c.clientId} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{c.clientName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                    <td className="px-4 py-3 text-right">{c.totalVisits}</td>
                    <td className="px-4 py-3 text-right text-green-600">{fmtS(c.totalSpent)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${c.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {fmtS(c.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!clients.length && <Empty />}
        </div>
      </div>
    );
  }

  function renderDebt() {
    const d = debtData;
    if (!d) return <Empty />;
    const s = d.summary;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <KpiCard label="Jami qarz" value={fmtS(s?.totalDebt)} color="red" />
          <KpiCard label="Qarzdor mijozlar" value={s?.totalClients} color="amber" />
          <KpiCard label="O'rtacha qarz" value={fmtS(s?.averageDebt)} color="amber" />
          <KpiCard label="Muddati o'tgan" value={fmtS(s?.overdueDebt)} color="red" />
          <KpiCard label="Muddati o'tgan mijozlar" value={s?.overdueClients} color="red" />
          <KpiCard label="Qarzdorlik %i" value={`${s?.debtRate}%`} color="amber" />
        </div>
        {d.aging?.length ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
            <h4 className="font-medium mb-3 text-sm">Qarz yoshi (Aging)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {d.aging.map((a: any, i: number) => (
                <div key={i} className="rounded-xl bg-muted/30 p-3 text-center">
                  <div className="text-lg font-bold text-red-500">{fmtS(a.amount)}</div>
                  <div className="text-xs font-medium text-muted-foreground">{a.ageRange}</div>
                  <div className="text-xs text-muted-foreground">{a.count} ta · {a.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border font-medium text-sm">Eng ko'p qarzdorlar</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Mijoz</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Telefon</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Qarz</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Kunlar</th>
                </tr>
              </thead>
              <tbody>
                {d.topDebtors?.map((c: any) => (
                  <tr key={c.clientId} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{c.clientName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">{fmtS(c.totalDebt)}</td>
                    <td className="px-4 py-3 text-right text-amber-600">{c.daysOverdue} kun</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!d.topDebtors?.length && <Empty />}
        </div>
      </div>
    );
  }

  function renderMarketing() {
    const d = marketingData;
    if (!d) return <Empty />;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard label="Referallar" value={d.summary?.totalReferrals} color="blue" />
          <KpiCard label="Yuborilgan tashriflar" value={d.summary?.totalVisits} color="green" />
          <KpiCard label="Yuborilgan mijozlar" value={d.summary?.totalClients} color="purple" />
          <KpiCard label="Referaldan daromad" value={fmtS(d.summary?.totalRevenue)} color="amber" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
            <h4 className="font-medium mb-3 text-sm">Referal reytingi</h4>
            {d.referrals?.length ? (
              <div className="space-y-3">
                {d.referrals.slice(0, 8).map((r: any, i: number) => (
                  <div key={r.referralId} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: COLORS[i % COLORS.length] }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium truncate">{r.referralName}</span>
                        <span className="text-xs text-muted-foreground ml-2">{r.visitCount} tashrif</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{r.phone}</span>
                        <span className="text-green-600">{fmtS(r.totalRevenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                Bu davr uchun referal ma'lumoti yo'q
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
            <h4 className="font-medium mb-3 text-sm">Yangi mijozlar manbasi</h4>
            {d.sourceStats?.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={d.sourceStats} cx="50%" cy="50%" outerRadius={80}
                    dataKey="clientCount" nameKey="sourceName"
                    label={({ sourceName, percentage }) => `${sourceName} ${percentage}%`}>
                    {d.sourceStats.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v} ta`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                Manba ma'lumoti yo'q
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderReturning() {
    const d = monthlyData;
    if (!d) return <Empty />;
    const nc = d.newClientStats;
    const genderData = nc?.byGender?.map((g: any) => ({
      name: g.gender === 'MALE' ? 'Erkak' : g.gender === 'FEMALE' ? 'Ayol' : 'Boshqa',
      value: g.count,
      percentage: g.percentage,
    })) || [];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard label="Yangi mijozlar" value={nc?.totalNewClients} color="blue" />
          <KpiCard label="Jami faol" value={nc?.totalActiveClients} color="green" />
          <KpiCard label="Retention rate" value={`${nc?.retentionRate}%`} color="purple"
            sub="Qaytuvchi mijozlar" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
            <h4 className="font-medium mb-3 text-sm">Jins bo'yicha taqsimot</h4>
            {genderData.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" outerRadius={80}
                    dataKey="value" nameKey="name"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}>
                    {genderData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <Empty />}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
            <h4 className="font-medium mb-3 text-sm">Manbalar bo'yicha yangi mijozlar</h4>
            {nc?.bySource?.length ? (
              <div className="space-y-2 mt-2">
                {nc.bySource.map((s: any, i: number) => (
                  <div key={s.sourceId} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="flex-1 text-sm">{s.sourceName}</span>
                    <span className="text-sm font-medium">{s.count} ta</span>
                    <span className="text-xs text-muted-foreground">{s.percentage}%</span>
                  </div>
                ))}
              </div>
            ) : <Empty />}
          </div>
        </div>
      </div>
    );
  }

  function renderBirthday() {
    const d = birthdayData;
    if (!d) return <Empty />;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard label="Bugun tug'ilgan kun" value={d.todayCount} color="red" />
          <KpiCard label="Bu hafta" value={d.thisWeekCount} color="amber" />
          <KpiCard label={`${d.daysAhead} kun ichida`} value={d.total} color="blue" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border font-medium text-sm flex items-center justify-between">
            <span>Kelayotgan tug'ilgan kunlar</span>
            <select value={birthdayDays} onChange={e => setBirthdayDays(+e.target.value)}
              className="text-xs border border-border rounded-lg px-2 py-1 bg-background">
              <option value={7}>7 kun</option>
              <option value={14}>14 kun</option>
              <option value={30}>30 kun</option>
              <option value={60}>60 kun</option>
              <option value={90}>90 kun</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Mijoz</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Telefon</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Tug'ilgan kun</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Kun</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">Yosh</th>
                </tr>
              </thead>
              <tbody>
                {d.clients?.map((c: any) => (
                  <tr key={c.clientId} className={`border-b border-border last:border-0 ${c.daysUntilBirthday === 0 ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}>
                    <td className="px-4 py-3 font-medium flex items-center gap-2">
                      {c.daysUntilBirthday === 0 && <span className="text-amber-500">🎂</span>}
                      {c.fullName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                    <td className="px-4 py-3 text-center">{c.birthdayDate}</td>
                    <td className="px-4 py-3 text-center">
                      {c.daysUntilBirthday === 0
                        ? <span className="text-amber-600 font-semibold">Bugun!</span>
                        : <span className="text-blue-600">{c.daysUntilBirthday} kun</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{c.turnsAge} yosh</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!d.clients?.length && <Empty />}
        </div>
      </div>
    );
  }

  function renderContent() {
    if (loading) return <Loading />;
    switch (tab) {
      case 'daily':     return renderDaily();
      case 'monthly':   return renderMonthly();
      case 'finance':   return renderFinance();
      case 'doctor':    return renderDoctor();
      case 'service':   return renderService();
      case 'room':      return renderRoom();
      case 'client':    return renderClient();
      case 'debt':      return renderDebt();
      case 'marketing': return renderMarketing();
      case 'returning': return renderReturning();
      case 'birthday':  return renderBirthday();
      default:          return null;
    }
  }

  const usesDateRange = ['doctor','service','client','debt','marketing'].includes(tab);
  const usesMonthYear = ['monthly','finance','room','returning'].includes(tab);

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              tab === t.id
                ? 'bg-blue-600 border-transparent text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-slate-800 border-border text-muted-foreground hover:bg-muted'
            }`}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center bg-white dark:bg-slate-800 rounded-2xl border border-border p-3">
        {tab === 'daily' && (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-muted-foreground" />
            <input type="date" value={dailyDate} max={today}
              onChange={e => setDailyDate(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}
        {usesMonthYear && (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-muted-foreground" />
            <select value={monthlyMonth} onChange={e => setMonthlyMonth(+e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
                .map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <input type="number" value={monthlyYear} min={2020} max={2030}
              onChange={e => setMonthlyYear(+e.target.value)}
              className="w-20 px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}
        {usesDateRange && (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-muted-foreground" />
            <input type="date" value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-muted-foreground text-xs">—</span>
            <input type="date" value={endDate} max={today}
              onChange={e => setEndDate(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}
        <div className="flex gap-2 ml-auto">
          <button onClick={load}
            className={`p-2 border border-border rounded-xl hover:bg-muted transition-colors ${loading ? 'text-blue-600' : 'text-muted-foreground'}`}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          {(tab === 'daily' || tab === 'monthly' || tab === 'debt') && (
            <button
              onClick={async () => {
                try {
                  if (tab === 'daily') await reportsApi.exportDaily(dailyDate);
                  else if (tab === 'monthly') await reportsApi.exportMonthly(monthlyMonth, monthlyYear);
                  else if (tab === 'debt') await reportsApi.exportDebt(startDate, endDate);
                  toast.success('Excel yuklab olindi');
                } catch { toast.error('Export xatoligi'); }
              }}
              className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl hover:bg-muted transition-colors text-xs text-muted-foreground">
              <Download size={14} /> Excel
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center gap-2 mb-1">
        {TABS.find(t => t.id === tab)?.icon}
        <h3 className="font-semibold text-foreground text-sm">{TABS.find(t => t.id === tab)?.label} hisoboti</h3>
      </div>
      {renderContent()}
    </div>
  );
}
