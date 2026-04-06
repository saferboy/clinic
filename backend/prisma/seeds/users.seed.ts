import { RecordStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { prisma } from './db';

export async function seedUsers() {
  console.log('👥 Foydalanuvchilar yaratilmoqda...');

  // Barcha rollar uchun umumiy parol
  const commonPassword = '12345';
  const passwordHash = await bcrypt.hash(commonPassword, 10);

  const users = [
    {
      id: 1,
      role_id: 1, // SuperAdmin
      full_name: 'Super Administrator',
      login: 'superadmin',
      email: 'superadmin@clinic.com',
      phone: '+998900000001',
    },
    {
      id: 2,
      role_id: 2, // Admin
      full_name: 'System Administrator',
      login: 'admin',
      email: 'admin@clinic.com',
      phone: '+998900000002',
    },
    {
      id: 3,
      role_id: 3, // Doctor
      full_name: 'Dr. John Smith',
      login: 'doctor',
      email: 'doctor@clinic.com',
      phone: '+998900000003',
    },
    {
      id: 4,
      role_id: 4, // Nurse
      full_name: 'Nurse Jane',
      login: 'nurse',
      email: 'nurse@clinic.com',
      phone: '+998900000004',
    },
    {
      id: 5,
      role_id: 5, // Receptionist
      full_name: 'Receptionist Mary',
      login: 'receptionist',
      email: 'receptionist@clinic.com',
      phone: '+998900000005',
    },
    {
      id: 6,
      role_id: 6, // Accountant
      full_name: 'Accountant Bob',
      login: 'accountant',
      email: 'accountant@clinic.com',
      phone: '+998900000006',
    },
  ];

  // Avval rollar mavjudligini tekshiramiz
  const roles = await prisma.userRole.findMany({
    where: { status: RecordStatus.ACTIVE },
  });

  if (roles.length === 0) {
    console.warn('  ⚠️  Rollar hali yaratilmagan! Avval user-roles seed ni ishga tushiring.');
    return;
  }

  for (const user of users) {
    await prisma.user.upsert({
      where: { login: user.login },
      update: { 
        role_id: user.role_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        status: RecordStatus.ACTIVE,
      },
      create: {
        id: user.id,
        role_id: user.role_id,
        full_name: user.full_name,
        login: user.login,
        password: passwordHash,
        email: user.email,
        phone: user.phone,
        status: RecordStatus.ACTIVE,
      },
    });
    
    const roleName = roles.find(r => r.id === user.role_id)?.name || 'N/A';
    console.log(`  ✅ User yaratildi: ${user.login} (rol: ${roleName})`);
  }

  console.log(`  ✅ Jami: ${users.length} ta foydalanuvchi\n`);

  // Login ma'lumotlarini chiqarish
  console.log('📝 Login ma\'lumotlari:');
  console.log('┌───────────────┬───────────────┬───────────────────────┐');
  console.log('│ Login         │ Parol         │ Rol                   │');
  console.log('├───────────────┼───────────────┼───────────────────────┤');
  console.log('│ superadmin    │ 12345         │ SuperAdmin            │');
  console.log('│ admin         │ 12345         │ Admin                 │');
  console.log('│ doctor        │ 12345         │ Doctor                │');
  console.log('│ nurse         │ 12345         │ Nurse                 │');
  console.log('│ receptionist  │ 12345         │ Receptionist          │');
  console.log('│ accountant    │ 12345         │ Accountant            │');
  console.log('└───────────────┴───────────────┴───────────────────────┘\n');
}
