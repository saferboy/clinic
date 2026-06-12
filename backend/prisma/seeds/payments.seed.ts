import { prisma } from './db';

// Helpers
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 8) + 9, 0, 0, 0); // 09:00–17:00
  return d;
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────
// 1. OtherPaidGroup — xarajat guruhlari
// ─────────────────────────────────────────────
const OTHER_PAID_GROUPS = [
  { name: 'Kommunal to\'lovlar',   description: 'Elektr, gaz, suv, internet' },
  { name: 'Xodimlar maoshi',       description: 'Oylik ish haqi to\'lovlari' },
  { name: 'Tibbiy buyumlar',       description: 'Dori-darmon, bir martalik jihozlar' },
  { name: 'Qurilish va ta\'mirlash', description: 'Klinika binosi va jihozlarini ta\'mirlash' },
  { name: 'Marketing',             description: 'Reklama va marketing xarajatlari' },
  { name: 'Boshqa xarajatlar',     description: 'Tasniflashga kirmagan xarajatlar' },
];

// ─────────────────────────────────────────────
// Payment scenariylar
// ─────────────────────────────────────────────

// Holat 1 — To'liq to'langan visit (DONE)
// Holat 2 — Qisman to'langan visit, qarz bor (COMPLETED)
// Holat 3 — Avans to'lov, keyinroq visit bilan bog'langan
// Holat 4 — Faqat ClientPaid (visit yo'q, balans to'ldirish)
// Holat 5 — Boshqa kirimlar (xona ijarasi, konsultatsiya to'lovi)
// Holat 6 — Kommunal xarajatlar (OtherPaid + group)
// Holat 7 — Maosh to'lovlari (OtherPaid + group)
// Holat 8 — Tibbiy buyumlar (OtherPaid + group)
// Holat 9 — To'lovning bekor qilingan versiyasi (soft-deleted emas, lekin nol bo'lgan)
// Holat 10 — Ko'p to'lovli visit (ikki qismda to'landi)

export async function seedPayments() {
  console.log('💰 To\'lovlar seed jarayoni boshlandi...\n');

  // ── mavjud ma'lumotlarni olish ────────────────────────────────────
  const adminUser = await prisma.user.findFirst({
    where: { deleted_at: null, role: { name: { in: ['Admin', 'SuperAdmin'] } } },
    select: { id: true, full_name: true },
  });

  const accountant = await prisma.user.findFirst({
    where: { deleted_at: null, role: { name: 'Accountant' } },
    select: { id: true, full_name: true },
  });

  const receptionist = await prisma.user.findFirst({
    where: { deleted_at: null, role: { name: 'Receptionist' } },
    select: { id: true, full_name: true },
  });

  const registeredBy = adminUser?.id ?? accountant?.id ?? receptionist?.id ?? 1;

  const clients = await prisma.client.findMany({
    where: { deleted_at: null },
    select: { id: true, full_name: true },
    take: 20,
  });

  const visits = await prisma.visit.findMany({
    where: { deleted_at: null },
    select: {
      id: true,
      client_id: true,
      status: true,
      total_amount: true,
      paid_amount: true,
      debt_amount: true,
    },
    take: 30,
    orderBy: { visit_date: 'desc' },
  });

  if (clients.length === 0) {
    console.log('⚠️  Avval mijozlar seedini ishga tushiring!\n  npm run seed:clients-only\n');
    return;
  }

  let paymentCount = 0;
  let clientPaidCount = 0;
  let otherPaidCount = 0;

  // ── 1. OtherPaidGroup yaratish ────────────────────────────────────
  console.log('  📁 OtherPaidGroup\'lar yaratilmoqda...');
  const groupIds: number[] = [];

  for (const g of OTHER_PAID_GROUPS) {
    const existing = await prisma.otherPaidGroup.findFirst({
      where: { name: g.name, deleted_at: null },
    });
    if (existing) {
      groupIds.push(existing.id);
      console.log(`    ⏭️  Mavjud: ${g.name}`);
      continue;
    }
    const group = await prisma.otherPaidGroup.create({
      data: { ...g, registered_by: registeredBy },
    });
    groupIds.push(group.id);
    console.log(`    ✅ Yaratildi: ${g.name}`);
  }

  // ── 2. Holat: Visit uchun to'liq to'lov (Payment INCOME) ─────────
  console.log('\n  💵 Holat 2 — Visit uchun to\'liq to\'lovlar...');
  const doneVisits = visits.filter(v => v.status === 'DONE' || v.status === 'COMPLETED');

  for (const visit of doneVisits.slice(0, 5)) {
    const amount = Number(visit.total_amount);
    if (amount <= 0) continue;

    await prisma.payment.create({
      data: {
        payment_type:  'INCOME',
        amount,
        description:   `Visit #${visit.id} uchun to'liq to'lov`,
        client_id:     visit.client_id,
        visit_id:      visit.id,
        payment_date:  daysAgo(Math.floor(Math.random() * 14)),
        registered_by: registeredBy,
      },
    });

    // Visit paid_amount ni yangilaymiz
    await prisma.visit.update({
      where: { id: visit.id },
      data: { paid_amount: amount, debt_amount: 0 },
    });

    paymentCount++;
    console.log(`    ✅ Visit #${visit.id}: ${amount.toLocaleString()} so'm`);
  }

  // ── 3. Holat: Qisman to'lov + qarz qolishi ───────────────────────
  console.log('\n  ⚠️  Holat 3 — Qisman to\'lovlar (qarz bor)...');
  const partialVisits = visits.filter(
    v => (v.status === 'COMPLETED' || v.status === 'IN_PROGRESS') && Number(v.total_amount) > 0,
  );

  for (const visit of partialVisits.slice(0, 4)) {
    const total = Number(visit.total_amount);
    const partialAmount = Math.round(total * 0.5); // 50% to'lash

    await prisma.payment.create({
      data: {
        payment_type:  'INCOME',
        amount:        partialAmount,
        description:   `Visit #${visit.id} — qisman to'lov (50%)`,
        client_id:     visit.client_id,
        visit_id:      visit.id,
        payment_date:  daysAgo(Math.floor(Math.random() * 7)),
        registered_by: registeredBy,
      },
    });

    await prisma.visit.update({
      where: { id: visit.id },
      data: {
        paid_amount:  partialAmount,
        debt_amount:  total - partialAmount,
      },
    });

    paymentCount++;
    console.log(
      `    ✅ Visit #${visit.id}: ${partialAmount.toLocaleString()} so'm (qarz: ${(total - partialAmount).toLocaleString()})`,
    );
  }

  // ── 4. Holat: Ko'p qismli to'lov (2 ta payment) ──────────────────
  console.log('\n  💳 Holat 4 — Ko\'p qismli to\'lovlar...');
  const multiPayVisits = visits.slice(5, 8);

  for (const visit of multiPayVisits) {
    const total = Number(visit.total_amount);
    if (total <= 0) continue;

    const first  = Math.round(total * 0.6);
    const second = total - first;

    await prisma.payment.create({
      data: {
        payment_type:  'INCOME',
        amount:        first,
        description:   `Visit #${visit.id} — 1-qism to'lov`,
        client_id:     visit.client_id,
        visit_id:      visit.id,
        payment_date:  daysAgo(10),
        registered_by: registeredBy,
      },
    });

    await prisma.payment.create({
      data: {
        payment_type:  'INCOME',
        amount:        second,
        description:   `Visit #${visit.id} — 2-qism to'lov (yakuniy)`,
        client_id:     visit.client_id,
        visit_id:      visit.id,
        payment_date:  daysAgo(3),
        registered_by: registeredBy,
      },
    });

    await prisma.visit.update({
      where: { id: visit.id },
      data: { paid_amount: total, debt_amount: 0 },
    });

    paymentCount += 2;
    console.log(`    ✅ Visit #${visit.id}: ${first.toLocaleString()} + ${second.toLocaleString()} so'm`);
  }

  // ── 5. Holat: Mijoz balansini to'ldirish (ClientPaid, visit yo'q) ─
  console.log('\n  💼 Holat 5 — Avans to\'lovlar (visit yo\'q)...');
  const clientPaidAmounts = [100000, 200000, 150000, 300000, 250000, 500000];

  for (let i = 0; i < Math.min(clients.length, 6); i++) {
    const client = clients[i];
    const amount = clientPaidAmounts[i];

    await prisma.clientPaid.create({
      data: {
        client_id:     client.id,
        amount,
        description:   'Avans to\'lov — balans to\'ldirish',
        payment_date:  daysAgo(Math.floor(Math.random() * 20) + 1),
        registered_by: registeredBy,
      },
    });

    clientPaidCount++;
    console.log(`    ✅ ${client.full_name}: ${amount.toLocaleString()} so'm avans`);
  }

  // ── 6. Holat: ClientPaid visit bilan bog'liq ─────────────────────
  console.log('\n  🔗 Holat 6 — Visit uchun avans to\'lov...');
  const linkedVisits = visits.slice(0, 3);

  for (const visit of linkedVisits) {
    if (!visit.client_id) continue;
    const total = Number(visit.total_amount);
    if (total <= 0) continue;

    const prepaid = Math.round(total * 0.3);

    await prisma.clientPaid.create({
      data: {
        client_id:     visit.client_id,
        visit_id:      visit.id,
        amount:        prepaid,
        description:   `Visit #${visit.id} uchun avans to'lov`,
        payment_date:  daysAgo(Math.floor(Math.random() * 5) + 1),
        registered_by: registeredBy,
      },
    });

    clientPaidCount++;
    console.log(`    ✅ Visit #${visit.id}: ${prepaid.toLocaleString()} so'm avans`);
  }

  // ── 7. Holat: Boshqa kirimlar (visit bilan bog'liq emas) ──────────
  console.log('\n  📈 Holat 7 — Boshqa kirimlar...');
  const otherIncomes = [
    { amount: 500000,  description: 'Xona ijarasi to\'lovi (3-qavat)' },
    { amount: 200000,  description: 'Tibbiy sertifikat berish xizmati' },
    { amount: 350000,  description: 'Online konsultatsiya to\'lovi' },
    { amount: 1000000, description: 'Korporativ mijoz shartnomasi' },
    { amount: 150000,  description: 'Laboratoriya natijasi ko\'chirma' },
  ];

  for (let i = 0; i < otherIncomes.length; i++) {
    const { amount, description } = otherIncomes[i];
    await prisma.payment.create({
      data: {
        payment_type:  'INCOME',
        amount,
        description,
        payment_date:  daysAgo(Math.floor(Math.random() * 30) + 1),
        registered_by: registeredBy,
      },
    });
    paymentCount++;
    console.log(`    ✅ Kirim: ${amount.toLocaleString()} — ${description}`);
  }

  // ── 8. Holat: Kommunal xarajatlar (OtherPaid) ────────────────────
  console.log('\n  🏠 Holat 8 — Kommunal xarajatlar...');
  const kommunalGroupId = groupIds[0]; // "Kommunal to'lovlar"
  const kommunalItems = [
    { amount: 320000, description: 'Elektr energiya — may oyи' },
    { amount: 85000,  description: 'Gaz — may oyi' },
    { amount: 45000,  description: 'Suv — may oyi' },
    { amount: 120000, description: 'Internet (Beeline Biz)' },
  ];

  for (const item of kommunalItems) {
    await prisma.otherPaid.create({
      data: {
        type:          'OUTCOME',
        amount:        item.amount,
        description:   item.description,
        group_id:      kommunalGroupId,
        payment_date:  daysAgo(Math.floor(Math.random() * 10) + 1),
        registered_by: registeredBy,
      },
    });
    otherPaidCount++;
    console.log(`    ✅ ${item.description}: ${item.amount.toLocaleString()} so'm`);
  }

  // ── 9. Holat: Maosh to'lovlari (OtherPaid) ───────────────────────
  console.log('\n  👨‍💼 Holat 9 — Maosh to\'lovlari...');
  const maoshGroupId = groupIds[1]; // "Xodimlar maoshi"
  const doctors = await prisma.user.findMany({
    where: { deleted_at: null, role: { name: { in: ['Doctor', 'Nurse', 'Receptionist'] } } },
    select: { id: true, full_name: true },
    take: 5,
  });

  for (const doctor of doctors) {
    const salary = rand([1500000, 2000000, 2500000, 3000000, 1800000]);
    await prisma.otherPaid.create({
      data: {
        type:          'OUTCOME',
        amount:        salary,
        description:   `${doctor.full_name} — may oyi maoshi`,
        group_id:      maoshGroupId,
        payment_date:  daysAgo(1),
        registered_by: registeredBy,
      },
    });
    otherPaidCount++;
    console.log(`    ✅ ${doctor.full_name}: ${salary.toLocaleString()} so'm`);
  }

  // ── 10. Holat: Tibbiy buyumlar (OtherPaid) ────────────────────────
  console.log('\n  💊 Holat 10 — Tibbiy buyumlar xarajatlari...');
  const tibbiyGroupId = groupIds[2]; // "Tibbiy buyumlar"
  const tibbiyItems = [
    { amount: 450000, description: 'Bir martalik qo\'lqoplar (100 ta quti)' },
    { amount: 180000, description: 'Spirt va dezinfeksiya vositalari' },
    { amount: 650000, description: 'Steril dressing materiallar' },
    { amount: 320000, description: 'Qon olish naychalari (vacutainer)' },
    { amount: 250000, description: 'Niqoblar va himoya ko\'zoynaklari' },
  ];

  for (const item of tibbiyItems) {
    await prisma.otherPaid.create({
      data: {
        type:          'OUTCOME',
        amount:        item.amount,
        description:   item.description,
        group_id:      tibbiyGroupId,
        payment_date:  daysAgo(Math.floor(Math.random() * 14) + 1),
        registered_by: registeredBy,
      },
    });
    otherPaidCount++;
    console.log(`    ✅ ${item.description}: ${item.amount.toLocaleString()} so'm`);
  }

  // ── 11. Holat: Marketing xarajatlari (OtherPaid) ─────────────────
  console.log('\n  📣 Holat 11 — Marketing xarajatlari...');
  const marketingGroupId = groupIds[4]; // "Marketing"
  const marketingItems = [
    { amount: 800000,  description: 'Instagram reklama (may oyi)' },
    { amount: 500000,  description: 'Telegram kanal reklama' },
    { amount: 1200000, description: 'Billbord ijarasi (1 oy)' },
    { amount: 350000,  description: 'Vizitka va buklet bosmasi' },
  ];

  for (const item of marketingItems) {
    await prisma.otherPaid.create({
      data: {
        type:          'OUTCOME',
        amount:        item.amount,
        description:   item.description,
        group_id:      marketingGroupId,
        payment_date:  daysAgo(Math.floor(Math.random() * 20) + 5),
        registered_by: registeredBy,
      },
    });
    otherPaidCount++;
    console.log(`    ✅ ${item.description}: ${item.amount.toLocaleString()} so'm`);
  }

  // ── 12. Holat: Qurilish va ta'mirlash (OtherPaid) ─────────────────
  console.log('\n  🔧 Holat 12 — Ta\'mirlash xarajatlari...');
  const tarmirGroupId = groupIds[3]; // "Qurilish va ta'mirlash"
  const tamirItems = [
    { amount: 2500000, description: 'Kutish zali ta\'miri va bo\'yash' },
    { amount: 1800000, description: 'Konditsioner o\'rnatish (2 ta)' },
    { amount: 450000,  description: 'Santexnika ta\'miri' },
  ];

  for (const item of tamirItems) {
    await prisma.otherPaid.create({
      data: {
        type:          'OUTCOME',
        amount:        item.amount,
        description:   item.description,
        group_id:      tarmirGroupId,
        payment_date:  daysAgo(Math.floor(Math.random() * 25) + 5),
        registered_by: registeredBy,
      },
    });
    otherPaidCount++;
    console.log(`    ✅ ${item.description}: ${item.amount.toLocaleString()} so'm`);
  }

  // ── 13. Holat: Kunlik kirim (oxirgi 30 kun uchun trend) ───────────
  console.log('\n  📊 Holat 13 — 30 kunlik trend uchun kunlik kirimlar...');
  const clientsForTrend = clients.slice(0, Math.min(clients.length, 10));

  for (let day = 29; day >= 0; day--) {
    const dailyCount = Math.floor(Math.random() * 3) + 2; // 2–4 ta to'lov
    for (let j = 0; j < dailyCount; j++) {
      const client = rand(clientsForTrend);
      const amount = rand([80000, 120000, 150000, 200000, 250000, 300000, 450000, 500000]);
      const visit  = visits.find(v => v.client_id === client.id);

      await prisma.payment.create({
        data: {
          payment_type:  'INCOME',
          amount,
          description:   `Xizmat to'lovi — ${new Date(daysAgo(day)).toLocaleDateString('uz-UZ')}`,
          client_id:     client.id,
          visit_id:      visit?.id ?? null,
          payment_date:  daysAgo(day),
          registered_by: registeredBy,
        },
      });
      paymentCount++;
    }
  }
  console.log(`    ✅ 30 kunlik trend ma'lumotlari yaratildi (${30 * 3} ta yaqin)\n`);

  // ── Yakuniy hisobot ───────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   💰  PAYMENT SEED YAKUNLANDI            ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  ✅  Payment       : ${String(paymentCount).padStart(3)} ta            ║`);
  console.log(`║  ✅  ClientPaid    : ${String(clientPaidCount).padStart(3)} ta            ║`);
  console.log(`║  ✅  OtherPaid     : ${String(otherPaidCount).padStart(3)} ta            ║`);
  console.log(`║  ✅  OtherPaidGroup: ${String(groupIds.length).padStart(3)} ta            ║`);
  console.log('╚══════════════════════════════════════════╝\n');
}
