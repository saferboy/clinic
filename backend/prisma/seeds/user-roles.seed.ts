import { RecordStatus } from '@prisma/client';
import { prisma } from './db';

export async function seedUserRoles() {
  console.log('📋 Rollar yaratilmoqda...');

  const roles = [
    {
      id: 1,
      name: 'SuperAdmin',
      description: 'Super administrator - barcha huquqlar',
      permissions: { all: true },
    },
    {
      id: 2,
      name: 'Admin',
      description: 'Tizim administratori - to\'liq huquq',
      permissions: {
        client: { create: true, read: true, update: true, delete: true },
        visit: { create: true, read: true, update: true, delete: true },
        payment: { create: true, read: true, update: true, delete: true },
        user: { create: true, read: true, update: true, delete: true },
        role: { create: true, read: true, update: true, delete: true },
        report: { create: true, read: true, update: true, delete: true },
      },
    },
    {
      id: 3,
      name: 'Doctor',
      description: 'Shifokor - qabul va xizmat ko\'rsatish',
      permissions: {
        client: { create: true, read: true, update: true, delete: false },
        visit: { create: true, read: true, update: true, delete: false },
        payment: { create: false, read: true, update: false, delete: false },
        user: { create: false, read: true, update: false, delete: false },
        role: { create: false, read: false, update: false, delete: false },
        report: { create: false, read: true, update: false, delete: false },
      },
    },
    {
      id: 4,
      name: 'Nurse',
      description: 'Hamshira - yordamchi funksiyalar',
      permissions: {
        client: { create: false, read: true, update: false, delete: false },
        visit: { create: false, read: true, update: false, delete: false },
        payment: { create: false, read: false, update: false, delete: false },
        user: { create: false, read: true, update: false, delete: false },
        role: { create: false, read: false, update: false, delete: false },
        report: { create: false, read: true, update: false, delete: false },
      },
    },
    {
      id: 5,
      name: 'Receptionist',
      description: 'Qabul xonasi - ro\'yxatga olish',
      permissions: {
        client: { create: true, read: true, update: true, delete: false },
        visit: { create: true, read: true, update: true, delete: false },
        payment: { create: true, read: true, update: false, delete: false },
        user: { create: false, read: true, update: false, delete: false },
        role: { create: false, read: false, update: false, delete: false },
        report: { create: false, read: true, update: false, delete: false },
      },
    },
    {
      id: 6,
      name: 'Accountant',
      description: 'Buxgalter - moliya boshqaruvi',
      permissions: {
        client: { create: false, read: true, update: false, delete: false },
        visit: { create: false, read: true, update: false, delete: false },
        payment: { create: true, read: true, update: true, delete: false },
        user: { create: false, read: true, update: false, delete: false },
        role: { create: false, read: false, update: false, delete: false },
        report: { create: true, read: true, update: false, delete: false },
      },
    },
  ];

  for (const role of roles) {
    await prisma.userRole.upsert({
      where: { id: role.id },
      update: { 
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        status: RecordStatus.ACTIVE,
      },
      create: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        status: RecordStatus.ACTIVE,
      },
    });
    console.log(`  ✅ Rol yaratildi: ${role.name}`);
  }

  console.log(`  ✅ Jami: ${roles.length} ta rol\n`);
}

// Agar bu fayl to'g'ridan-to'g'ri ishga tushirilsa
if (require.main === module) {
  const { prisma } = require('./db');
  seedUserRoles()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
