import { prisma } from './seeds/db';
import { seedUserRoles } from './seeds/user-roles.seed';
import { seedUsers } from './seeds/users.seed';
import { seedDepartments } from './seeds/departments.seed';
import { seedRegions } from './seeds/regions.seed';
import { seedDistricts } from './seeds/districts.seed';
import { seedSources } from './seeds/sources.seed';
import { seedClientGroups } from './seeds/client-groups.seed';
import { seedClients } from './seeds/clients.seed';

async function main() {
  console.log('\n🌱 ========================================');
  console.log('🌱  SEED JARAYONI BOSHLANDI');
  console.log('🌱 ========================================\n');

  // 1. Rollar
  await seedUserRoles();

  // 2. Foydalanuvchilar
  await seedUsers();

  // 3. Departamentlar
  await seedDepartments();

  // 4. Viloyatlar
  await seedRegions();

  // 5. Tumanlar
  await seedDistricts();

  // 6. Manbalar
  await seedSources();

  // 7. Mijoz guruhlari
  await seedClientGroups();

  // 8. Mijozlar
  await seedClients();

  console.log('🌱 ========================================');
  console.log('✅  SEED JARAYONI MUVAFFAQIYATLI YAKUNLANDI!');
  console.log('🌱 ========================================\n');

  await prisma.$disconnect();
  console.log('🎉 Database disconnected\n');
}

main()
  .catch(async (e) => {
    console.error('❌ Xatolik:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
