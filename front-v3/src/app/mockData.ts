import { User, Client, Visit, Payment, Service, Room } from './types';

export const mockUsers: User[] = [
  { id: '1', name: 'Akbar Toshmatov', email: 'admin@clinic.uz', role: 'admin', phone: '+998901234567', active: true, createdAt: '2024-01-01' },
  { id: '2', name: 'Dr. Nilufar Karimova', email: 'nilufar@clinic.uz', role: 'doctor', phone: '+998901234568', specialty: 'Terapevt', active: true, createdAt: '2024-01-15' },
  { id: '3', name: 'Dr. Jasur Rahimov', email: 'jasur@clinic.uz', role: 'doctor', phone: '+998901234572', specialty: 'Kardiolog', active: true, createdAt: '2024-01-20' },
  { id: '4', name: 'Zulfiya Sharipova', email: 'nurse@clinic.uz', role: 'nurse', phone: '+998901234569', active: true, createdAt: '2024-02-01' },
  { id: '5', name: 'Madina Yusupova', email: 'receptionist@clinic.uz', role: 'receptionist', phone: '+998901234570', active: true, createdAt: '2024-02-15' },
  { id: '6', name: 'Sardor Mirzayev', email: 'accountant@clinic.uz', role: 'accountant', phone: '+998901234571', active: true, createdAt: '2024-03-01' },
  { id: '7', name: 'Dilorom Hasanova', email: 'dilorom@clinic.uz', role: 'nurse', phone: '+998901234573', active: false, createdAt: '2024-03-10' },
];

export const mockClients: Client[] = [
  { id: 'c1', name: 'Bobur Xolmatov', phone: '+998901111111', email: 'bobur@mail.uz', birthDate: '1985-03-15', gender: 'male', address: 'Toshkent, Yunusobod', group: 'VIP', source: 'Reklama', balance: 150000, totalVisits: 8, lastVisit: '2026-03-28', createdAt: '2025-01-10', status: 'active' },
  { id: 'c2', name: 'Malika Tursunova', phone: '+998902222222', email: 'malika@mail.uz', birthDate: '1990-07-22', gender: 'female', address: 'Toshkent, Chilonzor', group: 'Oddiy', source: 'Do\'st tavsiyasi', balance: -50000, totalVisits: 3, lastVisit: '2026-03-20', createdAt: '2025-03-05', status: 'active' },
  { id: 'c3', name: 'Ulugbek Nazarov', phone: '+998903333333', email: 'ulug@mail.uz', birthDate: '1978-11-05', gender: 'male', address: 'Samarqand', group: 'Korporativ', source: 'Internet', balance: 500000, totalVisits: 15, lastVisit: '2026-04-01', createdAt: '2024-08-15', status: 'active' },
  { id: 'c4', name: 'Gulnora Abdullayeva', phone: '+998904444444', email: 'gulnora@mail.uz', birthDate: '1995-02-28', gender: 'female', address: 'Toshkent, Mirzo Ulugbek', group: 'Oddiy', source: 'Reklama', balance: 0, totalVisits: 2, lastVisit: '2026-02-15', createdAt: '2026-01-20', status: 'active' },
  { id: 'c5', name: 'Sherzod Ergashev', phone: '+998905555555', email: 'sherzod@mail.uz', birthDate: '1982-09-10', gender: 'male', address: 'Namangan', group: 'VIP', source: 'Shifokor tavsiyasi', balance: -200000, totalVisits: 20, lastVisit: '2026-03-30', createdAt: '2024-06-01', status: 'active' },
  { id: 'c6', name: 'Mohira Qodirov', phone: '+998906666666', email: 'mohira@mail.uz', birthDate: '1998-12-01', gender: 'female', address: 'Toshkent, Bektemir', group: 'Oddiy', source: 'Instagram', balance: 75000, totalVisits: 5, lastVisit: '2026-03-25', createdAt: '2025-06-10', status: 'active' },
  { id: 'c7', name: 'Jamshid Xasanov', phone: '+998907777777', email: 'jamshid@mail.uz', birthDate: '1975-05-18', gender: 'male', address: 'Andijon', group: 'Korporativ', source: 'Do\'st tavsiyasi', balance: 300000, totalVisits: 12, lastVisit: '2026-04-02', createdAt: '2024-11-05', status: 'active' },
  { id: 'c8', name: 'Nodira Sobirov', phone: '+998908888888', email: 'nodira@mail.uz', birthDate: '1992-08-30', gender: 'female', address: 'Toshkent, Shayxontohur', group: 'Oddiy', source: 'Internet', balance: -100000, totalVisits: 6, lastVisit: '2026-03-15', createdAt: '2025-02-20', status: 'inactive' },
  { id: 'c9', name: 'Bahodir Yuldashev', phone: '+998909999999', email: 'bahodir@mail.uz', birthDate: '1988-04-12', gender: 'male', address: 'Buxoro', group: 'VIP', source: 'Shifokor tavsiyasi', balance: 1000000, totalVisits: 25, lastVisit: '2026-04-03', createdAt: '2024-03-15', status: 'active' },
  { id: 'c10', name: 'Feruza Islamova', phone: '+998900000000', email: 'feruza@mail.uz', birthDate: '2000-01-25', gender: 'female', address: 'Toshkent, Olmazor', group: 'Oddiy', source: 'Instagram', balance: 25000, totalVisits: 1, lastVisit: '2026-04-03', createdAt: '2026-04-03', status: 'active' },
  { id: 'c11', name: 'Alisher Zokirov', phone: '+998911111111', email: 'alisher@mail.uz', birthDate: '1980-06-07', gender: 'male', address: 'Qashqadaryo', group: 'Korporativ', source: 'Reklama', balance: 200000, totalVisits: 9, lastVisit: '2026-03-28', createdAt: '2025-01-30', status: 'active' },
  { id: 'c12', name: 'Ziyoda Mansurova', phone: '+998922222222', email: 'ziyoda@mail.uz', birthDate: '1993-10-14', gender: 'female', address: 'Toshkent, Uchtepa', group: 'Oddiy', source: 'Do\'st tavsiyasi', balance: -30000, totalVisits: 4, lastVisit: '2026-03-22', createdAt: '2025-07-15', status: 'active' },
];

export const mockServices: Service[] = [
  { id: 's1', name: 'Konsultatsiya', category: 'Umumiy', price: 100000, duration: 30, active: true },
  { id: 's2', name: 'Qon tahlili', category: 'Laboratoriya', price: 80000, duration: 15, active: true },
  { id: 's3', name: 'EKG', category: 'Diagnostika', price: 120000, duration: 20, active: true },
  { id: 's4', name: 'UZI', category: 'Diagnostika', price: 200000, duration: 30, active: true },
  { id: 's5', name: 'Fizioterapiya', category: 'Davolash', price: 150000, duration: 45, active: true },
  { id: 's6', name: 'Massaj', category: 'Davolash', price: 180000, duration: 60, active: true },
  { id: 's7', name: 'Rentgen', category: 'Diagnostika', price: 90000, duration: 15, active: true },
  { id: 's8', name: "Ko'z ko'rigi", category: 'Oftalm', price: 110000, duration: 25, active: true },
];

export const mockRooms: Room[] = [
  { id: 'r1', name: '1-xona', number: '101', type: 'Konsultatsiya', status: 'occupied', floor: 1, doctor: 'Dr. Nilufar Karimova' },
  { id: 'r2', name: '2-xona', number: '102', type: 'Konsultatsiya', status: 'available', floor: 1, doctor: 'Dr. Jasur Rahimov' },
  { id: 'r3', name: '3-xona', number: '103', type: 'Diagnostika', status: 'occupied', floor: 1, doctor: '' },
  { id: 'r4', name: '4-xona', number: '201', type: 'Davolash', status: 'available', floor: 2, doctor: '' },
  { id: 'r5', name: '5-xona', number: '202', type: 'Laboratoriya', status: 'maintenance', floor: 2, doctor: '' },
  { id: 'r6', name: '6-xona', number: '203', type: 'Konsultatsiya', status: 'available', floor: 2, doctor: '' },
];

export const mockVisits: Visit[] = [
  { id: 'v1', clientId: 'c1', clientName: 'Bobur Xolmatov', doctorId: '2', doctorName: 'Dr. Nilufar Karimova', roomId: 'r1', roomName: '1-xona', services: [{ id: 's1', name: 'Konsultatsiya', price: 100000 }, { id: 's2', name: 'Qon tahlili', price: 80000 }], date: '2026-04-03', time: '09:00', duration: 45, status: 'in-progress', notes: '', totalAmount: 180000, paidAmount: 180000, createdAt: '2026-04-03' },
  { id: 'v2', clientId: 'c9', clientName: 'Bahodir Yuldashev', doctorId: '3', doctorName: 'Dr. Jasur Rahimov', roomId: 'r2', roomName: '2-xona', services: [{ id: 's3', name: 'EKG', price: 120000 }, { id: 's4', name: 'UZI', price: 200000 }], date: '2026-04-03', time: '10:00', duration: 50, status: 'confirmed', notes: 'VIP mijoz', totalAmount: 320000, paidAmount: 200000, createdAt: '2026-04-02' },
  { id: 'v3', clientId: 'c10', clientName: 'Feruza Islamova', doctorId: '2', doctorName: 'Dr. Nilufar Karimova', roomId: 'r1', roomName: '1-xona', services: [{ id: 's1', name: 'Konsultatsiya', price: 100000 }], date: '2026-04-03', time: '11:30', duration: 30, status: 'scheduled', notes: '', totalAmount: 100000, paidAmount: 0, createdAt: '2026-04-03' },
  { id: 'v4', clientId: 'c7', clientName: 'Jamshid Xasanov', doctorId: '3', doctorName: 'Dr. Jasur Rahimov', roomId: 'r2', roomName: '2-xona', services: [{ id: 's5', name: 'Fizioterapiya', price: 150000 }], date: '2026-04-03', time: '14:00', duration: 45, status: 'scheduled', notes: '', totalAmount: 150000, paidAmount: 150000, createdAt: '2026-04-02' },
  { id: 'v5', clientId: 'c3', clientName: 'Ulugbek Nazarov', doctorId: '2', doctorName: 'Dr. Nilufar Karimova', roomId: 'r1', roomName: '1-xona', services: [{ id: 's1', name: 'Konsultatsiya', price: 100000 }, { id: 's7', name: 'Rentgen', price: 90000 }], date: '2026-04-02', time: '09:00', duration: 45, status: 'completed', notes: '', totalAmount: 190000, paidAmount: 190000, createdAt: '2026-04-01' },
  { id: 'v6', clientId: 'c5', clientName: 'Sherzod Ergashev', doctorId: '3', doctorName: 'Dr. Jasur Rahimov', roomId: 'r2', roomName: '2-xona', services: [{ id: 's4', name: 'UZI', price: 200000 }, { id: 's3', name: 'EKG', price: 120000 }], date: '2026-04-02', time: '11:00', duration: 50, status: 'completed', notes: 'Qarz bor', totalAmount: 320000, paidAmount: 120000, createdAt: '2026-04-01' },
  { id: 'v7', clientId: 'c2', clientName: 'Malika Tursunova', doctorId: '2', doctorName: 'Dr. Nilufar Karimova', roomId: 'r1', roomName: '1-xona', services: [{ id: 's6', name: 'Massaj', price: 180000 }], date: '2026-04-01', time: '10:00', duration: 60, status: 'completed', notes: '', totalAmount: 180000, paidAmount: 180000, createdAt: '2026-03-30' },
  { id: 'v8', clientId: 'c4', clientName: 'Gulnora Abdullayeva', doctorId: '3', doctorName: 'Dr. Jasur Rahimov', roomId: 'r2', roomName: '2-xona', services: [{ id: 's8', name: "Ko'z ko'rigi", price: 110000 }], date: '2026-04-01', time: '14:00', duration: 25, status: 'cancelled', notes: 'Bekor qilindi', totalAmount: 110000, paidAmount: 0, createdAt: '2026-03-31' },
  { id: 'v9', clientId: 'c6', clientName: 'Mohira Qodirov', doctorId: '2', doctorName: 'Dr. Nilufar Karimova', roomId: 'r1', roomName: '1-xona', services: [{ id: 's1', name: 'Konsultatsiya', price: 100000 }, { id: 's5', name: 'Fizioterapiya', price: 150000 }], date: '2026-03-28', time: '09:00', duration: 75, status: 'completed', notes: '', totalAmount: 250000, paidAmount: 250000, createdAt: '2026-03-27' },
  { id: 'v10', clientId: 'c11', clientName: 'Alisher Zokirov', doctorId: '3', doctorName: 'Dr. Jasur Rahimov', roomId: 'r2', roomName: '2-xona', services: [{ id: 's2', name: 'Qon tahlili', price: 80000 }], date: '2026-03-28', time: '11:00', duration: 15, status: 'completed', notes: '', totalAmount: 80000, paidAmount: 80000, createdAt: '2026-03-27' },
  { id: 'v11', clientId: 'c8', clientName: 'Nodira Sobirov', doctorId: '2', doctorName: 'Dr. Nilufar Karimova', roomId: 'r1', roomName: '1-xona', services: [{ id: 's4', name: 'UZI', price: 200000 }], date: '2026-03-15', time: '10:30', duration: 30, status: 'no-show', notes: 'Kelmadi', totalAmount: 200000, paidAmount: 0, createdAt: '2026-03-14' },
  { id: 'v12', clientId: 'c12', clientName: 'Ziyoda Mansurova', doctorId: '3', doctorName: 'Dr. Jasur Rahimov', roomId: 'r2', roomName: '2-xona', services: [{ id: 's1', name: 'Konsultatsiya', price: 100000 }], date: '2026-04-03', time: '15:00', duration: 30, status: 'scheduled', notes: '', totalAmount: 100000, paidAmount: 0, createdAt: '2026-04-02' },
];

export const mockPayments: Payment[] = [
  { id: 'p1', clientId: 'c1', clientName: 'Bobur Xolmatov', visitId: 'v1', amount: 180000, type: 'card', direction: 'income', description: 'Konsultatsiya + Qon tahlili', date: '2026-04-03', createdBy: 'Madina Yusupova' },
  { id: 'p2', clientId: 'c9', clientName: 'Bahodir Yuldashev', visitId: 'v2', amount: 200000, type: 'cash', direction: 'income', description: 'Qisman to\'lov - EKG + UZI', date: '2026-04-03', createdBy: 'Madina Yusupova' },
  { id: 'p3', clientId: 'c7', clientName: 'Jamshid Xasanov', visitId: 'v4', amount: 150000, type: 'transfer', direction: 'income', description: 'Fizioterapiya', date: '2026-04-03', createdBy: 'Sardor Mirzayev' },
  { id: 'p4', clientId: 'c3', clientName: 'Ulugbek Nazarov', visitId: 'v5', amount: 190000, type: 'card', direction: 'income', description: 'Konsultatsiya + Rentgen', date: '2026-04-02', createdBy: 'Madina Yusupova' },
  { id: 'p5', clientId: 'c5', clientName: 'Sherzod Ergashev', visitId: 'v6', amount: 120000, type: 'cash', direction: 'income', description: 'Qisman to\'lov', date: '2026-04-02', createdBy: 'Sardor Mirzayev' },
  { id: 'p6', clientId: 'c2', clientName: 'Malika Tursunova', visitId: 'v7', amount: 180000, type: 'card', direction: 'income', description: 'Massaj', date: '2026-04-01', createdBy: 'Madina Yusupova' },
  { id: 'p7', clientId: 'c6', clientName: 'Mohira Qodirov', visitId: 'v9', amount: 250000, type: 'cash', direction: 'income', description: 'Konsultatsiya + Fizioterapiya', date: '2026-03-28', createdBy: 'Madina Yusupova' },
  { id: 'p8', clientId: 'c11', clientName: 'Alisher Zokirov', visitId: 'v10', amount: 80000, type: 'transfer', direction: 'income', description: 'Qon tahlili', date: '2026-03-28', createdBy: 'Sardor Mirzayev' },
  { id: 'p9', clientId: '', clientName: '', visitId: '', amount: 500000, type: 'cash', direction: 'outcome', description: 'Tibbiy jihozlar xaridi', date: '2026-03-25', createdBy: 'Sardor Mirzayev' },
  { id: 'p10', clientId: '', clientName: '', visitId: '', amount: 300000, type: 'transfer', direction: 'outcome', description: 'Dori-darmon xaridi', date: '2026-04-01', createdBy: 'Sardor Mirzayev' },
  { id: 'p11', clientId: 'c9', clientName: 'Bahodir Yuldashev', visitId: '', amount: 500000, type: 'card', direction: 'income', description: 'Oldindan to\'lov', date: '2026-03-20', createdBy: 'Madina Yusupova' },
  { id: 'p12', clientId: 'c3', clientName: 'Ulugbek Nazarov', visitId: '', amount: 300000, type: 'transfer', direction: 'income', description: 'Oldindan to\'lov', date: '2026-03-15', createdBy: 'Sardor Mirzayev' },
];

// Chart data
export const visitTrendData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 2, 4 + i);
  const day = date.getDate();
  return {
    date: `${date.getDate()}/${date.getMonth() + 1}`,
    tashriflar: Math.floor(Math.random() * 15) + 5,
    bajarilgan: Math.floor(Math.random() * 10) + 3,
  };
});

export const revenueMonthlyData = [
  { month: 'May', daromad: 4200000, xarajat: 1500000 },
  { month: 'Iyn', daromad: 3800000, xarajat: 1200000 },
  { month: 'Iyl', daromad: 5100000, xarajat: 1800000 },
  { month: 'Avg', daromad: 4600000, xarajat: 1600000 },
  { month: 'Sen', daromad: 5800000, xarajat: 2000000 },
  { month: 'Okt', daromad: 6200000, xarajat: 2200000 },
  { month: 'Noy', daromad: 5500000, xarajat: 1900000 },
  { month: 'Dek', daromad: 7100000, xarajat: 2500000 },
  { month: 'Yan', daromad: 6400000, xarajat: 2300000 },
  { month: 'Fev', daromad: 5900000, xarajat: 2100000 },
  { month: 'Mar', daromad: 6800000, xarajat: 2400000 },
  { month: 'Apr', daromad: 3200000, xarajat: 1100000 },
];

export const serviceDistributionData = [
  { name: 'Konsultatsiya', value: 35, color: '#3b82f6' },
  { name: 'Diagnostika', value: 28, color: '#10b981' },
  { name: 'Davolash', value: 20, color: '#f59e0b' },
  { name: 'Laboratoriya', value: 12, color: '#8b5cf6' },
  { name: 'Boshqa', value: 5, color: '#ef4444' },
];

export const doctorPerformanceData = [
  { name: 'Dr. Nilufar Karimova', tashriflar: 145, daromad: 14500000 },
  { name: 'Dr. Jasur Rahimov', tashriflar: 128, daromad: 12800000 },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
};

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-indigo-100 text-indigo-700',
    'in-progress': 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    'no-show': 'bg-gray-100 text-gray-700',
    available: 'bg-green-100 text-green-700',
    occupied: 'bg-amber-100 text-amber-700',
    maintenance: 'bg-red-100 text-red-700',
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    income: 'bg-green-100 text-green-700',
    outcome: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    scheduled: 'Rejalashtirilgan',
    confirmed: 'Tasdiqlangan',
    'in-progress': 'Davom etmoqda',
    completed: 'Bajarilgan',
    cancelled: 'Bekor qilingan',
    'no-show': 'Kelmadi',
    available: 'Bo\'sh',
    occupied: 'Band',
    maintenance: 'Ta\'mirda',
    active: 'Faol',
    inactive: 'Nofaol',
    income: 'Kirim',
    outcome: 'Chiqim',
    cash: 'Naqd',
    card: 'Karta',
    transfer: 'O\'tkazma',
    admin: 'Admin',
    doctor: 'Shifokor',
    nurse: 'Hamshira',
    receptionist: 'Registrator',
    accountant: 'Buxgalter',
    male: 'Erkak',
    female: 'Ayol',
  };
  return labels[status] || status;
};
