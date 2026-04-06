import { RecordStatus } from '@prisma/client';
import { prisma } from './db';

export async function seedClientGroups() {
  console.log('👥 Mijoz guruhlari yaratilmoqda...');

  const clientGroups = [
    { name: 'Oddiy', description: 'Oddiy mijozlar - standart narxlar' },
    { name: 'VIP', description: 'Muhim mijozlar - 10% chegirma' },
    { name: 'Korporativ', description: 'Korporativ shartnoma asosida xizmat ko\'rsatish' },
    { name: 'Sug\'urta', description: 'Sug\'urta kompaniyalari mijozlari' },
    { name: 'Imtiyozli', description: 'Imtiyozli mijozlar - 20% chegirma' },
  ];

  for (const group of clientGroups) {
    const existing = await prisma.clientGroup.findFirst({ where: { name: group.name } });
    if (existing) {
      await prisma.clientGroup.update({
        where: { id: existing.id },
        data: { status: RecordStatus.ACTIVE, description: group.description },
      });
    } else {
      await prisma.clientGroup.create({
        data: { name: group.name, description: group.description, status: RecordStatus.ACTIVE },
      });
    }
  }

  console.log(`  ✅ ${clientGroups.length} ta mijoz guruhi yaratildi\n`);
}
