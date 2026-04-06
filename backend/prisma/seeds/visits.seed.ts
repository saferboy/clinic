import { prisma } from './db';

export async function seedVisits() {
  console.log('🏥 Visitlar seed jarayoni boshlandi...\n');

  // Avval mijozlar va shifokorlarni tekshirish
  const clients = await prisma.client.findMany({
    where: { deleted_at: null },
    select: { id: true, full_name: true },
  });

  const doctors = await prisma.user.findMany({
    where: { 
      deleted_at: null,
      role: { name: 'Doctor' }
    },
    select: { id: true, full_name: true },
  });

  const services = await prisma.service.findMany({
    where: { deleted_at: null },
    select: { id: true, name: true, price: true },
  });

  const rooms = await prisma.room.findMany({
    where: { deleted_at: null },
    select: { id: true, name: true },
  });

  const referrals = await prisma.referral.findMany({
    where: { deleted_at: null },
    select: { id: true, full_name: true },
  });

  if (clients.length === 0 || doctors.length === 0) {
    console.log('⚠️  Avval mijozlar va shifokorlar seedlarini ishga tushiring!\n');
    console.log('npm run seed:clients-only\nnpm run seed:users\n');
    return;
  }

  // Test visitlar yaratish
  const visits = [
    {
      client_id: clients[0]?.id || 1,
      doctor_id: doctors[0]?.id || 1,
      status: 'COMPLETED' as const,
      total_amount: 250000,
      paid_amount: 250000,
      debt_amount: 0,
      description: 'Bosh og\'rig\'i, harorat 38°C',
      visit_date: new Date('2024-01-15T10:00:00Z'),
      has_referral: true,
    },
    {
      client_id: clients[1]?.id || 2,
      doctor_id: doctors[0]?.id || 1,
      status: 'IN_PROGRESS' as const,
      total_amount: 180000,
      paid_amount: 0,
      debt_amount: 180000,
      description: 'Muntazam tekshiruv',
      visit_date: new Date('2024-01-16T11:00:00Z'),
      has_referral: false,
    },
    {
      client_id: clients[2]?.id || 3,
      doctor_id: doctors[1]?.id || doctors[0]?.id || 1,
      status: 'SCHEDULED' as const,
      total_amount: 0,
      paid_amount: 0,
      debt_amount: 0,
      description: 'Oldindan yozilgan',
      visit_date: new Date('2024-01-20T14:00:00Z'),
      has_referral: false,
    },
  ];

  let created = 0;
  for (const visitData of visits) {
    try {
      const visit = await prisma.visit.create({
        data: {
          client: { connect: { id: visitData.client_id } },
          doctor: { connect: { id: visitData.doctor_id } },
          status: visitData.status,
          total_amount: visitData.total_amount,
          paid_amount: visitData.paid_amount,
          debt_amount: visitData.debt_amount,
          description: visitData.description,
          visit_date: visitData.visit_date,
        },
      });

      created++;
      console.log(`  ✅ Visit yaratildi: ${clients.find(c => c.id === visitData.client_id)?.full_name} → ${doctors.find(d => d.id === visitData.doctor_id)?.full_name} (${visitData.status})`);

      // VisitService qo'shish (agar COMPLETED yoki IN_PROGRESS bo'lsa)
      if (visitData.status === 'COMPLETED' || visitData.status === 'IN_PROGRESS') {
        const serviceCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < serviceCount; i++) {
          const service = services[i % services.length];
          await prisma.visitService.create({
            data: {
              visit: { connect: { id: visit.id } },
              service: { connect: { id: service.id } },
              price: service.price,
              quantity: 1,
              total: service.price,
            },
          });
        }
      }

      // VisitRoom qo'shish
      const room = rooms[0];
      if (room) {
        await prisma.visitRoom.create({
          data: {
            visit: { connect: { id: visit.id } },
            room: { connect: { id: room.id } },
            status: visitData.status === 'COMPLETED' ? 'COMPLETED' : visitData.status === 'IN_PROGRESS' ? 'IN_USE' : 'ASSIGNED',
            started_at: visitData.visit_date,
            ended_at: visitData.status === 'COMPLETED' ? new Date('2024-01-15T11:00:00Z') : null,
          },
        });
      }

      // VisitReferral qo'shish (agar has_referral=true bo'lsa)
      if (visitData.has_referral && referrals.length > 0) {
        const referral = referrals[0];
        await prisma.visitReferral.create({
          data: {
            visit: { connect: { id: visit.id } },
            referral: { connect: { id: referral.id } },
          },
        });
        console.log(`    📌 Tavsiya biriktirildi: ${referral.full_name}`);
      }
    } catch (error: any) {
      console.error(`  ❌ Xatolik: ${error.message}`);
    }
  }

  console.log(`\n✅ Visitlar seed jarayoni yakunlandi! (${created} ta yaratildi)\n`);
}
