import { prisma } from './db';

export async function seedServices() {
  console.log('🏥 Xizmatlar seed jarayoni boshlandi...\n');

  // Avval departmentlarni tekshirish
  const departments = await prisma.department.findMany({
    where: { deleted_at: null },
    select: { id: true, name: true },
  });

  if (departments.length === 0) {
    console.log('⚠️  Avval department seedlarini ishga tushiring!\n');
    console.log('npm run seed:departments\n');
    return;
  }

  // Xizmatlar ro'yxati
  const services = [
    // Terapiya bo'limi xizmatlari
    {
      name: 'Terapevt ko\'rigi',
      price: 100000,
      duration_min: 30,
      department_id: departments.find(d => d.name === 'Terapiya')?.id || departments[0]?.id,
      description: 'Bosh terapevt ko\'rigi va maslahati',
    },
    {
      name: 'Kardiolog ko\'rigi',
      price: 180000,
      duration_min: 45,
      department_id: departments.find(d => d.name === 'Terapiya')?.id || departments[0]?.id,
      description: 'Kardiolog tekshiruvi va maslahati',
    },
    {
      name: 'Nevrolog ko\'rigi',
      price: 180000,
      duration_min: 45,
      department_id: departments.find(d => d.name === 'Terapiya')?.id || departments[0]?.id,
      description: 'Nevrolog tekshiruvi va maslahati',
    },
    // Diagnostika bo'limi xizmatlari
    {
      name: 'UZI tekshiruvi',
      price: 150000,
      duration_min: 30,
      department_id: departments.find(d => d.name === 'Diagnostika')?.id || departments[1]?.id || departments[0]?.id,
      description: 'Ultratovush tekshiruvi',
    },
    {
      name: 'Rentgen',
      price: 80000,
      duration_min: 20,
      department_id: departments.find(d => d.name === 'Diagnostika')?.id || departments[1]?.id || departments[0]?.id,
      description: 'Rentgen tekshiruvi',
    },
    {
      name: 'EKG',
      price: 60000,
      duration_min: 15,
      department_id: departments.find(d => d.name === 'Diagnostika')?.id || departments[1]?.id || departments[0]?.id,
      description: 'Elektrokardiografiya tekshiruvi',
    },
    {
      name: 'Qon tahlili',
      price: 50000,
      duration_min: 15,
      department_id: departments.find(d => d.name === 'Diagnostika')?.id || departments[1]?.id || departments[0]?.id,
      description: 'Umumiy qon tahlili',
    },
    // Stomatologiya bo'limi xizmatlari
    {
      name: 'Stomatolog ko\'rigi',
      price: 120000,
      duration_min: 30,
      department_id: departments.find(d => d.name === 'Stomatologiya')?.id || departments[2]?.id || departments[0]?.id,
      description: 'Stomatolog tekshiruvi va maslahati',
    },
    {
      name: 'Tish tozalash',
      price: 200000,
      duration_min: 60,
      department_id: departments.find(d => d.name === 'Stomatologiya')?.id || departments[2]?.id || departments[0]?.id,
      description: 'Professional tish tozalash',
    },
    {
      name: 'Tish plomba',
      price: 300000,
      duration_min: 90,
      department_id: departments.find(d => d.name === 'Stomatologiya')?.id || departments[2]?.id || departments[0]?.id,
      description: 'Tish plomba qilish',
    },
    // Jarrohlik bo'limi xizmatlari
    {
      name: 'Jarroh ko\'rigi',
      price: 200000,
      duration_min: 45,
      department_id: departments.find(d => d.name === 'Jarrohlik')?.id || departments[3]?.id || departments[0]?.id,
      description: 'Jarroh tekshiruvi va maslahati',
    },
    {
      name: 'Kichik operatsiya',
      price: 500000,
      duration_min: 120,
      department_id: departments.find(d => d.name === 'Jarrohlik')?.id || departments[3]?.id || departments[0]?.id,
      description: 'Kichik jarrohlik operatsiyasi',
    },
  ];

  let created = 0;
  for (const serviceData of services) {
    try {
      await prisma.service.create({
        data: {
          ...serviceData,
          status: 'ACTIVE',
          created_at: new Date(),
          updated_at: new Date(),
          registered_by: 1, // Admin user
        },
      });
      created++;
      console.log(`  ✅ Xizmat yaratildi: ${serviceData.name} - ${serviceData.price.toLocaleString()} so'm (${serviceData.duration_min} daqiqa)`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`  ⚠️  Xizmat allaqachon mavjud: ${serviceData.name}`);
      } else {
        console.error(`  ❌ Xatolik: ${serviceData.name} - ${error.message}`);
      }
    }
  }

  console.log(`\n✅ Xizmatlar seed jarayoni yakunlandi! (${created} ta yaratildi)\n`);
}
