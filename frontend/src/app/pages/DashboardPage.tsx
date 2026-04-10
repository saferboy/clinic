import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, Calendar, CreditCard, TrendingUp, CheckCircle, Clock,
  AlertCircle, BedDouble, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import {
  mockClients, mockVisits, mockPayments,
  visitTrendData, revenueMonthlyData, serviceDistributionData, doctorPerformanceData,
  formatCurrency, getStatusColor, getStatusLabel
} from '../mockData';

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}

function KpiCard({ label, value, change, icon, color, sub }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${color}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const todayVisits = mockVisits.filter(v => v.date === '2026-04-03');
  const completedToday = todayVisits.filter(v => v.status === 'completed');
  const todayRevenue = mockPayments.filter(p => p.date === '2026-04-03' && p.direction === 'income')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalDebt = mockClients.filter(c => c.balance < 0).reduce((sum, c) => sum + Math.abs(c.balance), 0);
  const recentVisits = mockVisits.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Bugungi tashriflar"
          value={todayVisits.length}
          change={12}
          icon={<Calendar size={20} className="text-blue-600" />}
          color="bg-blue-50 dark:bg-blue-900/30"
          sub={`${completedToday.length} ta bajarilgan`}
        />
        <KpiCard
          label="Jami mijozlar"
          value={mockClients.length}
          change={8}
          icon={<Users size={20} className="text-green-600" />}
          color="bg-green-50 dark:bg-green-900/30"
          sub="5 ta yangi bu oy"
        />
        <KpiCard
          label="Bugungi daromad"
          value={formatCurrency(todayRevenue)}
          change={15}
          icon={<CreditCard size={20} className="text-amber-600" />}
          color="bg-amber-50 dark:bg-amber-900/30"
        />
        <KpiCard
          label="Jami qarz"
          value={formatCurrency(totalDebt)}
          change={-5}
          icon={<AlertCircle size={20} className="text-red-600" />}
          color="bg-red-50 dark:bg-red-900/30"
          sub={`${mockClients.filter(c => c.balance < 0).length} ta mijoz`}
        />
        <KpiCard
          label="Bo'sh xonalar"
          value="3 / 6"
          icon={<BedDouble size={20} className="text-purple-600" />}
          color="bg-purple-50 dark:bg-purple-900/30"
        />
        <KpiCard
          label="Rejalashtirilgan"
          value={todayVisits.filter(v => v.status === 'scheduled').length}
          icon={<Clock size={20} className="text-indigo-600" />}
          color="bg-indigo-50 dark:bg-indigo-900/30"
          sub="Kutayotganlar"
        />
        <KpiCard
          label="Oylik daromad"
          value="6.8M so'm"
          change={10}
          icon={<TrendingUp size={20} className="text-teal-600" />}
          color="bg-teal-50 dark:bg-teal-900/30"
        />
        <KpiCard
          label="Bajarilgan"
          value={mockVisits.filter(v => v.status === 'completed').length}
          change={5}
          icon={<CheckCircle size={20} className="text-green-600" />}
          color="bg-green-50 dark:bg-green-900/30"
          sub="Jami tashriflar"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Visit Trend */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Tashriflar tendentsiyasi</h3>
              <p className="text-xs text-muted-foreground">So'nggi 30 kun</p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded"></span>Tashriflar</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block rounded"></span>Bajarilgan</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={visitTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="tashriflar" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="bajarilgan" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Service Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">Xizmatlar taqsimoti</h3>
            <p className="text-xs text-muted-foreground">Kategoriyalar bo'yicha</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={serviceDistributionData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {serviceDistributionData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => `${val}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {serviceDistributionData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }}></span>
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Daromad va xarajat</h3>
              <p className="text-xs text-muted-foreground">So'nggi 12 oy</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(val: number) => formatCurrency(val)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="daromad" name="Daromad" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="xarajat" name="Xarajat" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Doctor Performance */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-border shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-foreground">Shifokor faoliyati</h3>
            <p className="text-xs text-muted-foreground">Bu oy</p>
          </div>
          <div className="space-y-4 mt-4">
            {doctorPerformanceData.map((doc, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-foreground truncate mr-2">{doc.name.replace('Dr. ', '')}</span>
                  <span className="text-muted-foreground flex-shrink-0">{doc.tashriflar} ta</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(doc.tashriflar / 160) * 100}%`,
                      background: i === 0 ? '#3b82f6' : '#10b981'
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{formatCurrency(doc.daromad)}</div>
              </div>
            ))}
          </div>

          {/* Alerts */}
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Ogohlantirishlar</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Clock size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-700 dark:text-amber-400">4 ta tashrif kutmoqda</div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-red-700 dark:text-red-400">3 ta qarzkor mijoz</div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Activity size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700 dark:text-blue-400">5-xona ta'mirda</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Visits Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="font-semibold text-foreground">So'nggi tashriflar</h3>
            <p className="text-xs text-muted-foreground">Eng oxirgi 6 ta tashrif</p>
          </div>
          <button
            onClick={() => window.location.href = '/visits'}
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
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Sana / Vaqt</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Xizmatlar</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Summa</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Holat</th>
              </tr>
            </thead>
            <tbody>
              {recentVisits.map(visit => (
                <tr key={visit.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 text-xs font-semibold">
                        {visit.clientName.charAt(0)}
                      </div>
                      <span className="font-medium text-foreground">{visit.clientName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{visit.doctorName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div>{visit.date}</div>
                    <div className="text-xs">{visit.time}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {visit.services.slice(0, 2).map(s => (
                        <span key={s.id} className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">{s.name}</span>
                      ))}
                      {visit.services.length > 2 && (
                        <span className="px-1.5 py-0.5 bg-muted rounded text-xs text-muted-foreground">+{visit.services.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{formatCurrency(visit.totalAmount)}</div>
                    {visit.paidAmount < visit.totalAmount && (
                      <div className="text-xs text-red-500">Qarz: {formatCurrency(visit.totalAmount - visit.paidAmount)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                      {getStatusLabel(visit.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
