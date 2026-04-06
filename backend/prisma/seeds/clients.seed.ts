import { prisma } from './db';

export async function seedClients() {
  console.log('📋 Mijozlar seed jarayoni boshlandi...\n');

  // Avval region va districtlarni tekshirish
  const regions = await prisma.locRegion.findMany({
    where: { deleted_at: null },
    select: { id: true, name: true },
  });

  const districts = await prisma.locDistrict.findMany({
    where: { deleted_at: null },
    select: { id: true, name: true, region_id: true },
  });

  const clientGroups = await prisma.clientGroup.findMany({
    where: { deleted_at: null },
    select: { id: true, name: true },
  });

  const sources = await prisma.source.findMany({
    where: { deleted_at: null },
    select: { id: true, name: true },
  });

  if (regions.length === 0 || clientGroups.length === 0 || sources.length === 0) {
    console.log('⚠️  Avval region, client-group va source seedlarini ishga tushiring!\n');
    console.log('npm run seed:regions\nnpm run seed:client-groups\nnpm run seed:sources\n');
    return;
  }

  // Test mijozlar yaratish
  const clients = [
    {
      full_name: 'John Doe',
      phone: '+998901234567',
      gender: 'MALE' as const,
      date_of_birth: new Date('1990-01-15'),
      address: 'Toshkent shahar, Chilonzor tumani',
      description: 'Doimiy mijoz',
      status: 'ACTIVE' as const,
      group_id: clientGroups[0]?.id || 1,
      region_id: regions[0]?.id || 1,
      district_id: districts.find(d => d.region_id === regions[0]?.id)?.id || null,
      source_id: sources[0]?.id || 1,
    },
    {
      full_name: 'Jane Smith',
      phone: '+998909876543',
      gender: 'FEMALE' as const,
      date_of_birth: new Date('1995-05-20'),
      address: 'Toshkent shahar, Yunusobod tumani',
      description: 'VIP mijoz',
      status: 'ACTIVE' as const,
      group_id: clientGroups[1]?.id || clientGroups[0]?.id || 1,
      region_id: regions[0]?.id || 1,
      district_id: districts.find(d => d.region_id === regions[0]?.id)?.id || null,
      source_id: sources[1]?.id || sources[0]?.id || 1,
    },
    {
      full_name: 'Bob Johnson',
      phone: '+998901112233',
      gender: 'MALE' as const,
      date_of_birth: new Date('1985-10-10'),
      address: 'Samarqand viloyati',
      description: null,
      status: 'ACTIVE' as const,
      group_id: clientGroups[0]?.id || 1,
      region_id: regions[1]?.id || regions[0]?.id || 1,
      district_id: null,
      source_id: sources[2]?.id || sources[0]?.id || 1,
    },
    {
      full_name: 'Alice Williams',
      phone: '+998905554433',
      gender: 'FEMALE' as const,
      date_of_birth: new Date('2000-03-25'),
      address: 'Farg\'ona viloyati',
      description: 'Yangi mijoz',
      status: 'ACTIVE' as const,
      group_id: clientGroups[0]?.id || 1,
      region_id: regions[2]?.id || regions[0]?.id || 1,
      district_id: null,
      source_id: sources[3]?.id || sources[0]?.id || 1,
    },
    {
      full_name: 'David Brown',
      phone: '+998907778899',
      gender: 'MALE' as const,
      date_of_birth: new Date('1988-12-05'),
      address: 'Andijon viloyati',
      description: 'Korporativ mijoz',
      status: 'ACTIVE' as const,
      group_id: clientGroups[2]?.id || clientGroups[0]?.id || 1,
      region_id: regions[3]?.id || regions[0]?.id || 1,
      district_id: null,
      source_id: sources[4]?.id || sources[0]?.id || 1,
    },
  ];

  let created = 0;
  for (const clientData of clients) {
    try {
      await prisma.client.create({
        data: {
          ...clientData,
          balance: 0,
          created_at: new Date(),
          updated_at: new Date(),
          registered_by: 1, // Admin user
        },
      });
      created++;
      console.log(`  ✅ Mijoz yaratildi: ${clientData.full_name} (${clientData.phone})`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`  ⚠️  Mijoz allaqachon mavjud: ${clientData.full_name}`);
      } else {
        console.error(`  ❌ Xatolik: ${clientData.full_name} - ${error.message}`);
      }
    }
  }

  console.log(`\n✅ Mijozlar seed jarayoni yakunlandi! (${created} ta yaratildi)\n`);
}
