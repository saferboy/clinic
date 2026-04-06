import { prisma } from './seeds/db';
import { seedReferrals } from './seeds/referrals.seed';

async function main() {
  console.log('\n🌱 ========================================');
  console.log('🌱  REFERRAL SEED JARAYONI BOSHLANDI');
  console.log('🌱 ========================================\n');

  await seedReferrals();

  console.log('🌱 ========================================');
  console.log('✅  REFERRAL SEED JARAYONI MUVAFFAQIYATLI YAKUNLANDI!');
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
