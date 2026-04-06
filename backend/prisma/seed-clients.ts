import { prisma } from './seeds/db';
import { seedClients } from './seeds/clients.seed';

async function main() {
  console.log('\n🌱 ========================================');
  console.log('🌱  CLIENT SEED JARAYONI BOSHLANDI');
  console.log('🌱 ========================================\n');

  await seedClients();

  console.log('🌱 ========================================');
  console.log('✅  CLIENT SEED JARAYONI MUVAFFAQIYATLI YAKUNLANDI!');
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
