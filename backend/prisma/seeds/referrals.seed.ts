import { prisma } from './db';

export async function seedReferrals() {
  console.log('🤝 Tavsiya tizimi seed jarayoni boshlandi...\n');

  // Test tavsiyalar yaratish
  const referrals = [
    {
      full_name: 'Dr. John Smith',
      phone: '+998901111111',
      description: 'Doimiy tavsiya qiluvchi shifokor',
    },
    {
      full_name: 'Jane Doe',
      phone: '+998902222222',
      description: 'Sobiq mijoz, doim tavsiya qiladi',
    },
    {
      full_name: 'Bob Johnson',
      phone: null,
      description: 'Telefon raqami yo\'q',
    },
    {
      full_name: 'Alice Williams',
      phone: '+998903333333',
      description: 'Instagram orqali kelgan mijoz',
    },
    {
      full_name: 'David Brown',
      phone: '+998904444444',
      description: 'Korporativ mijoz',
    },
  ];

  let created = 0;
  for (const referralData of referrals) {
    try {
      await prisma.referral.create({
        data: {
          ...referralData,
          status: 'ACTIVE',
          created_at: new Date(),
          updated_at: new Date(),
          registered_by: 1, // Admin user
        },
      });
      created++;
      console.log(`  ✅ Tavsiya yaratildi: ${referralData.full_name}${referralData.phone ? ` (${referralData.phone})` : ''}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`  ⚠️  Tavsiya allaqachon mavjud: ${referralData.full_name}`);
      } else {
        console.error(`  ❌ Xatolik: ${referralData.full_name} - ${error.message}`);
      }
    }
  }

  console.log(`\n✅ Tavsiya tizimi seed jarayoni yakunlandi! (${created} ta yaratildi)\n`);
}
