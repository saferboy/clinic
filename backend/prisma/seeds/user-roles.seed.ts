import { RecordStatus } from '@prisma/client';
import { prisma } from './db';

// ==================== PERMISSIONS TEMPLATE ====================
// Tizimda mavjud barcha resurslar va ularning mumkin bo'lgan amallari.
// Frontend UI va yangi rollar uchun reference sifatida ishlatiladi.

export const PERMISSION_RESOURCES = [
  { key: 'client',       label: 'Mijozlar' },
  { key: 'client-group', label: 'Mijoz guruhlari' },
  { key: 'visit',        label: 'Tashriflar' },
  { key: 'payment',      label: "To'lovlar" },
  { key: 'service',      label: 'Xizmatlar' },
  { key: 'room',         label: 'Xonalar' },
  { key: 'department',   label: "Bo'limlar" },
  { key: 'report',       label: 'Hisobotlar' },
  { key: 'user',         label: 'Foydalanuvchilar' },
  { key: 'role',         label: 'Rollar' },
  { key: 'source',       label: 'Manbalar' },
  { key: 'referral',     label: 'Tavsiyalar' },
] as const;

export const PERMISSION_ACTIONS = ['create', 'read', 'update', 'delete'] as const;

type ResourceKey = typeof PERMISSION_RESOURCES[number]['key'];
type ActionPerms = { create: boolean; read: boolean; update: boolean; delete: boolean };
type PermissionsMatrix = { [K in ResourceKey]?: ActionPerms };

function perms(
  client: ActionPerms,
  clientGroup: ActionPerms,
  visit: ActionPerms,
  payment: ActionPerms,
  service: ActionPerms,
  room: ActionPerms,
  department: ActionPerms,
  report: ActionPerms,
  user: ActionPerms,
  role: ActionPerms,
  source: ActionPerms,
  referral: ActionPerms,
): PermissionsMatrix {
  return {
    client,
    'client-group': clientGroup,
    visit,
    payment,
    service,
    room,
    department,
    report,
    user,
    role,
    source,
    referral,
  };
}

const full: ActionPerms  = { create: true,  read: true,  update: true,  delete: true  };
const view: ActionPerms  = { create: false, read: true,  update: false, delete: false };
const none: ActionPerms  = { create: false, read: false, update: false, delete: false };
const edit: ActionPerms  = { create: true,  read: true,  update: true,  delete: false };

// ==================== ROLE DEFINITIONS ====================

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
    description: "Tizim administratori - to'liq huquq",
    permissions: perms(full, full, full, full, full, full, full, full, full, full, full, full),
  },
  {
    id: 3,
    name: 'Doctor',
    description: "Shifokor - qabul va xizmat ko'rsatish",
    permissions: perms(
      edit, // client
      view, // client-group
      edit, // visit
      view, // payment
      view, // service
      view, // room
      view, // department
      view, // report
      view, // user
      none, // role
      view, // source
      view, // referral
    ),
  },
  {
    id: 4,
    name: 'Nurse',
    description: 'Hamshira - yordamchi funksiyalar',
    permissions: perms(
      view, // client
      view, // client-group
      view, // visit
      none, // payment
      view, // service
      view, // room
      none, // department
      view, // report
      view, // user
      none, // role
      none, // source
      none, // referral
    ),
  },
  {
    id: 5,
    name: 'Receptionist',
    description: "Qabul xonasi - ro'yxatga olish",
    permissions: perms(
      edit, // client
      view, // client-group
      edit, // visit
      edit, // payment
      view, // service
      view, // room
      view, // department
      view, // report
      view, // user
      none, // role
      view, // source
      view, // referral
    ),
  },
  {
    id: 6,
    name: 'Accountant',
    description: 'Buxgalter - moliya boshqaruvi',
    permissions: perms(
      view, // client
      view, // client-group
      view, // visit
      full, // payment
      view, // service
      none, // room
      none, // department
      edit, // report
      view, // user
      none, // role
      view, // source
      none, // referral
    ),
  },
];

// ==================== SEED FUNCTION ====================

export async function seedUserRoles() {
  console.log('📋 Rollar yaratilmoqda...');

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
    console.log(`  ✅ Rol: ${role.name}`);
  }

  // Sequence'ni MAX(id) ga sozlash, aks holda keyingi INSERT da
  // "duplicate key value violates unique constraint" xatosi chiqadi.
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('user_roles', 'id'), COALESCE((SELECT MAX(id) FROM user_roles), 1))`,
  );

  console.log(`  ✅ Jami: ${roles.length} ta rol\n`);
}

// Agar bu fayl to'g'ridan-to'g'ri ishga tushirilsa
if (require.main === module) {
  const { prisma } = require('./db');
  seedUserRoles()
    .then(async () => { await prisma.$disconnect(); })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
