import { prisma } from './seeds/db';
import { seedServices } from './seeds/services.seed';

async function main() {
  console.log('\n🌱 ========================================');
  console.log('🌱  SERVICE SEED JARAYONI BOSHLANDI');
  console.log('🌱 ========================================\n');

  await seedServices();

  console.log('🌱 ========================================');
  console.log('✅  SERVICE SEED JARAYONI MUVAFFAQIYATLI YAKUNLANDI!');
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
