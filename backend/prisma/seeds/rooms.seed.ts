import { prisma } from './db';

export async function seedRooms() {
  console.log('🏠 Xonalar seed jarayoni boshlandi...\n');

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

  // Test xonalar yaratish
  const rooms = [
    // Terapiya bo'limi xonalari
    {
      name: 'Terapiya Kabineti 1',
      room_number: '101',
      department_id: departments.find(d => d.name === 'Terapiya')?.id || departments[0]?.id,
      status: 'AVAILABLE' as const,
      description: '2 ta karavot, kompyuter',
      record_status: 'ACTIVE' as const,
    },
    {
      name: 'Terapiya Kabineti 2',
      room_number: '102',
      department_id: departments.find(d => d.name === 'Terapiya')?.id || departments[0]?.id,
      status: 'AVAILABLE' as const,
      description: '1 ta karavot, stol',
      record_status: 'ACTIVE' as const,
    },
    // Diagnostika bo'limi xonalari
    {
      name: 'UZI Kabineti',
      room_number: '201',
      department_id: departments.find(d => d.name === 'Diagnostika')?.id || departments[1]?.id || departments[0]?.id,
      status: 'AVAILABLE' as const,
      description: 'UZI apparati, kompyuter',
      record_status: 'ACTIVE' as const,
    },
    {
      name: 'Rentgen Kabineti',
      room_number: '202',
      department_id: departments.find(d => d.name === 'Diagnostika')?.id || departments[1]?.id || departments[0]?.id,
      status: 'MAINTENANCE' as const,
      description: 'Rentgen apparati',
      record_status: 'ACTIVE' as const,
    },
    // Stomatologiya bo'limi xonalari
    {
      name: 'Stomatolog Kabineti 1',
      room_number: '301',
      department_id: departments.find(d => d.name === 'Stomatologiya')?.id || departments[2]?.id || departments[0]?.id,
      status: 'AVAILABLE' as const,
      description: 'Stomatologik stul, asboblar',
      record_status: 'ACTIVE' as const,
    },
    {
      name: 'Stomatolog Kabineti 2',
      room_number: '302',
      department_id: departments.find(d => d.name === 'Stomatologiya')?.id || departments[2]?.id || departments[0]?.id,
      status: 'OCCUPIED' as const,
      description: 'Stomatologik stul, rentgen',
      record_status: 'ACTIVE' as const,
    },
    // Operatsiya xonalari
    {
      name: 'Operatsiya Xonasi 1',
      room_number: '401',
      department_id: departments.find(d => d.name === 'Jarrohlik')?.id || departments[3]?.id || departments[0]?.id,
      status: 'AVAILABLE' as const,
      description: 'Operatsiya stoli, sterilizatsiya',
      record_status: 'ACTIVE' as const,
    },
    {
      name: 'Operatsiya Xonasi 2',
      room_number: '402',
      department_id: departments.find(d => d.name === 'Jarrohlik')?.id || departments[3]?.id || departments[0]?.id,
      status: 'CLOSED' as const,
      description: 'Zaxira operatsiya xonasi',
      record_status: 'ACTIVE' as const,
    },
  ];

  let created = 0;
  for (const roomData of rooms) {
    try {
      await prisma.room.create({
        data: {
          ...roomData,
          created_at: new Date(),
          updated_at: new Date(),
          registered_by: 1, // Admin user
        },
      });
      created++;
      console.log(`  ✅ Xona yaratildi: ${roomData.name} (${roomData.room_number}) - Status: ${roomData.status}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`  ⚠️  Xona allaqachon mavjud: ${roomData.name}`);
      } else {
        console.error(`  ❌ Xatolik: ${roomData.name} - ${error.message}`);
      }
    }
  }

  console.log(`\n✅ Xonalar seed jarayoni yakunlandi! (${created} ta yaratildi)\n`);
}
