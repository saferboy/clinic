import { RecordStatus } from '@prisma/client';
import { prisma } from './db';

export async function seedSources() {
  console.log('📢 Manbalar (Sources) yaratilmoqda...');

  const sources = [
    'Instagram',
    'Telegram',
    'Google',
    'Tavsiya (Referal)',
    'Reklama',
    'Telefon',
    'Sayt',
    'Boshqa',
  ];

  for (const source of sources) {
    const existing = await prisma.source.findFirst({ where: { name: source } });
    if (existing) {
      await prisma.source.update({
        where: { id: existing.id },
        data: { status: RecordStatus.ACTIVE },
      });
    } else {
      await prisma.source.create({
        data: { name: source, status: RecordStatus.ACTIVE },
      });
    }
  }

  console.log(`  ✅ ${sources.length} ta manba yaratildi\n`);
}
