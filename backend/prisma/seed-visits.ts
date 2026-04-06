import { prisma } from './seeds/db';
import { seedVisits } from './seeds/visits.seed';

async function main() {
  console.log('\n🌱 ========================================');
  console.log('🌱  VISIT SEED JARAYONI BOSHLANDI');
  console.log('🌱 ========================================\n');

  await seedVisits();

  console.log('🌱 ========================================');
  console.log('✅  VISIT SEED JARAYONI MUVAFFAQIYATLI YAKUNLANDI!');
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
