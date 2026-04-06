import { prisma } from './db';
import { seedRegions } from './regions.seed';
import { seedDistricts } from './districts.seed';

async function main() {
  console.log('\n🌍 ========================================');
  console.log('🌍  LOCATION SEED JARAYONI BOSHLANDI');
  console.log('🌍 ========================================\n');

  // 1. Viloyatlar
  await seedRegions();

  // 2. Tumanlar
  await seedDistricts();

  console.log('🌍 ========================================');
  console.log('✅  LOCATION SEED MUVAFFAQIYATLI YAKUNLANDI!');
  console.log('🌍 ========================================\n');

  await prisma.$disconnect();
  console.log('🎉 Database disconnected\n');
}

main()
  .catch(async (e) => {
    console.error('❌ Xatolik:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
