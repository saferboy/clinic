import { prisma } from './seeds/db';
import { seedPayments } from './seeds/payments.seed';

async function main() {
  console.log('\n💰 ========================================');
  console.log('💰  PAYMENT SEED JARAYONI BOSHLANDI');
  console.log('💰 ========================================\n');

  await seedPayments();

  console.log('💰 ========================================');
  console.log('✅  PAYMENT SEED MUVAFFAQIYATLI YAKUNLANDI!');
  console.log('💰 ========================================\n');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Xatolik:', e);
  await prisma.$disconnect();
  process.exit(1);
});
