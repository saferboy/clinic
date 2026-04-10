import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Download, Printer, Mail, RefreshCw, Calendar } from 'lucide-react';
import {
  revenueMonthlyData, serviceDistributionData, doctorPerformanceData,
  visitTrendData, mockClients, mockVisits, formatCurrency
} from '../mockData';

type ReportType = 'daily' | 'monthly' | 'doctor' | 'client' | 'service' | 'debt';

const reportTypes = [
  { id: 'daily' as ReportType, label: 'Kunlik hisobot', icon: '📅' },
  { id: 'monthly' as ReportType, label: 'Oylik hisobot', icon: '📆' },
  { id: 'doctor' as ReportType, label: 'Shifokor hisoboti', icon: '🩺' },
  { id: 'client' as ReportType, label: 'Mijoz hisoboti', icon: '👥' },
  { id: 'service' as ReportType, label: 'Xizmat hisoboti', icon: '💊' },
  { id: 'debt' as ReportType, label: 'Qarz hisoboti', icon: '💰' },
];

const debtClients = mockClients.filter(c => c.balance < 0);
const topClients = [...mockClients].sort((a, b) => b.totalVisits - a.totalVisits).slice(0, 5);

export function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState('2026-04-03');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const renderReport = () => {
    switch (reportType) {
      case 'daily':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Bugungi tashriflar", value: "4 ta" },
                { label: "Bajarilgan", value: "1 ta" },
                { label: "Bugungi daromad", value: "530,000 so'm" },
                { label: "Yangi mijozlar", value: "1 ta" },
              ].map(stat => (
                <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-border text-center">
                  <div className="font-bold text-lg text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
              <h4 className="font-medium mb-4">Bugungi tashriflar jadvali</h4>
              <div className="space-y-3">
                {mockVisits.filter(v => v.date === '2026-04-03').map(v => (
                  <div key={v.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <div>
                      <div className="font-medium text-sm text-foreground">{v.clientName}</div>
                      <div className="text-xs text-muted-foreground">{v.time} · {v.doctorName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(v.totalAmount)}</div>
                      <div className="text-xs text-muted-foreground">{v.roomName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'monthly':
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
              <h4 className="font-medium mb-4">Oylik daromad va xarajat</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="daromad" name="Daromad" fill="#3b82f6" radius={[4,4,0,0]} />
                  <Bar dataKey="xarajat" name="Xarajat" fill="#f87171" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-border text-center">
                <div className="text-xl font-bold text-green-600">6.8M</div>
                <div className="text-xs text-muted-foreground">Mart daromadi</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-border text-center">
                <div className="text-xl font-bold text-red-600">2.4M</div>
                <div className="text-xs text-muted-foreground">Mart xarajati</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-border text-center">
                <div className="text-xl font-bold text-blue-600">4.4M</div>
                <div className="text-xs text-muted-foreground">Sof foyda</div>
              </div>
            </div>
          </div>
        );

      case 'doctor':
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
              <h4 className="font-medium mb-4">Shifokorlar faoliyati</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={doctorPerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="tashriflar" name="Tashriflar" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {doctorPerformanceData.map((doc, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-border">
                  <div className="font-medium text-foreground mb-2">{doc.name}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs">Tashriflar</div>
                      <div className="font-semibold text-blue-600">{doc.tashriflar} ta</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs">Daromad</div>
                      <div className="font-semibold text-green-600">{formatCurrency(doc.daromad)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'client':
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
              <h4 className="font-medium mb-4">Eng faol mijozlar</h4>
              <div className="space-y-3">
                {topClients.map((client, i) => (
                  <div key={client.id} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-blue-500'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">{client.name}</span>
                        <span className="text-muted-foreground">{client.totalVisits} ta tashrif</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full mt-1">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(client.totalVisits / 25) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'service':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
                <h4 className="font-medium mb-4">Xizmatlar taqsimoti</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={serviceDistributionData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                      {serviceDistributionData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border p-5">
                <h4 className="font-medium mb-4">Xizmat tafsilotlari</h4>
                <div className="space-y-3">
                  {serviceDistributionData.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }}></span>
                        <span className="text-sm text-foreground">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.value}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'debt':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-border text-center">
                <div className="text-xl font-bold text-red-600">{debtClients.length}</div>
                <div className="text-xs text-muted-foreground">Qarzkor mijozlar</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-border text-center">
                <div className="text-xl font-bold text-red-600">
                  {formatCurrency(Math.abs(debtClients.reduce((s, c) => s + c.balance, 0)))}
                </div>
                <div className="text-xs text-muted-foreground">Jami qarz</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-border text-center">
                <div className="text-xl font-bold text-amber-600">
                  {formatCurrency(Math.abs(Math.round(debtClients.reduce((s, c) => s + c.balance, 0) / (debtClients.length || 1))))}
                </div>
                <div className="text-xs text-muted-foreground">O'rtacha qarz</div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border font-medium">Qarzkor mijozlar ro'yxati</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Mijoz</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Telefon</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Qarz miqdori</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">So'nggi tashrif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {debtClients.map(client => (
                      <tr key={client.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium text-foreground">{client.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{client.phone}</td>
                        <td className="px-4 py-3 font-semibold text-red-600">
                          {formatCurrency(Math.abs(client.balance))}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{client.lastVisit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Report type selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {reportTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
              reportType === type.id
                ? 'bg-blue-600 border-transparent text-white shadow-lg shadow-blue-600/20'
                : 'bg-white dark:bg-slate-800 border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            <span className="text-xl">{type.icon}</span>
            <span className="text-xs text-center leading-tight">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Filters and actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-white dark:bg-slate-800 rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2 flex-1">
          <Calendar size={16} className="text-muted-foreground flex-shrink-0" />
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span className="text-muted-foreground">–</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-2">
          <button onClick={handleRefresh}
            className={`p-2.5 border border-border rounded-xl hover:bg-muted transition-colors ${isRefreshing ? 'animate-spin text-blue-600' : 'text-muted-foreground'}`}>
            <RefreshCw size={16} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl hover:bg-muted transition-colors text-sm text-muted-foreground">
            <Download size={16} />
            Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl hover:bg-muted transition-colors text-sm text-muted-foreground">
            <Printer size={16} />
            Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl hover:bg-muted transition-colors text-sm text-muted-foreground">
            <Mail size={16} />
            Email
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xl">{reportTypes.find(r => r.id === reportType)?.icon}</span>
          <h3 className="font-semibold text-foreground">{reportTypes.find(r => r.id === reportType)?.label}</h3>
          <span className="text-xs text-muted-foreground">({startDate} — {endDate})</span>
        </div>
        {renderReport()}
      </div>
    </div>
  );
}
