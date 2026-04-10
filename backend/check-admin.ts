import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, RecordStatus } from '@prisma/client';

// .env yuklash
dotenv.config({ path: path.join(__dirname, './.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkAdmin() {
  const admin = await prisma.user.findFirst({
    where: { login: 'admin' },
    include: { role: true },
  });

  if (!admin) {
    console.log('❌ Admin foydalanuvchisi topilmadi!');
    process.exit(1);
  }

  console.log('✅ Admin topildi:');
  console.log('  ID:', admin.id);
  console.log('  Login:', admin.login);
  console.log('  Full Name:', admin.full_name);
  console.log('  Email:', admin.email);
  console.log('  Status:', admin.status);
  console.log('  Deleted At:', admin.deleted_at);
  console.log('  Role ID:', admin.role_id);
  console.log('  Role Name:', admin.role?.name);
  console.log('  Password Hash:', admin.password.substring(0, 30) + '...');

  // Parolni tekshirish
  const testPassword = '12345';
  const isValid = await bcrypt.compare(testPassword, admin.password);
  console.log('\n🔐 Parol test (12345):', isValid ? '✅ TO\'G\'RI' : '❌ NOTO\'G\'RI');

  // Agar noto'g'ri bo'lsa, yangi hash yaratish
  if (!isValid) {
    console.log('\n🔄 Parolni qayta o\'rnatish...');
    const newHash = await bcrypt.hash('12345', 10);
    await prisma.user.update({
      where: { login: 'admin' },
      data: { password: newHash },
    });
    
    // Qayta tekshirish
    const updated = await prisma.user.findFirst({ where: { login: 'admin' } });
    const isValidAgain = await bcrypt.compare('12345', updated!.password);
    console.log('✅ Yangilangan parol test:', isValidAgain ? '✅ TO\'G\'RI' : '❌ NOTO\'G\'RI');
  }

  // deleted_at ni tozalash - bu asosiy muammo!
  if (admin.deleted_at) {
    console.log('\n⚠️  Admin soft delete qilingan! deleted_at tozalanmoqda...');
    await prisma.user.update({
      where: { login: 'admin' },
      data: { deleted_at: null },
    });
    console.log('✅ Admin deleted_at null ga o\'zgartirildi!');
  }

  // Superadmin bilan solishtirish
  const superadmin = await prisma.user.findFirst({
    where: { login: 'superadmin' },
  });

  if (superadmin) {
    console.log('\n📊 Superadmin bilan solishtirish:');
    console.log('  Superadmin Status:', superadmin.status);
    console.log('  Superadmin Deleted At:', superadmin.deleted_at);
    const isSuperValid = await bcrypt.compare('12345', superadmin.password);
    console.log('  Superadmin Parol test:', isSuperValid ? '✅ TO\'G\'RI' : '❌ NOTO\'G\'RI');
  }

  await prisma.$disconnect();
}

checkAdmin().catch(console.error);
