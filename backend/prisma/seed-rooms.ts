import { prisma } from './seeds/db';
import { seedRooms } from './seeds/rooms.seed';

async function main() {
  console.log('\n🌱 ========================================');
  console.log('🌱  ROOM SEED JARAYONI BOSHLANDI');
  console.log('🌱 ========================================\n');

  await seedRooms();

  console.log('🌱 ========================================');
  console.log('✅  ROOM SEED JARAYONI MUVAFFAQIYATLI YAKUNLANDI!');
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
