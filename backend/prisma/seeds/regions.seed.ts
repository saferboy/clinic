import { RecordStatus } from '@prisma/client';
import { prisma } from './db';
import * as fs from 'fs';
import * as path from 'path';

export async function seedRegions() {
  console.log('📍 Viloyatlar yaratilmoqda...');

  const locationDataPath = path.join(__dirname, 'location.json');
  const locationData = JSON.parse(fs.readFileSync(locationDataPath, 'utf-8'));
  const regions = locationData.regions;

  let created = 0;
  let skipped = 0;

  for (const region of regions) {
    // Avval ID bo'yicha tekshiramiz
    const byId = await prisma.locRegion.findUnique({ where: { id: region.id } });

    if (byId) {
      skipped++;
      continue;
    }

    // Nom bo'yicha ham tekshiramiz
    const byName = await prisma.locRegion.findFirst({ where: { name: region.name } });

    if (byName) {
      skipped++;
      continue;
    }

    // Yangi region yaratamiz
    await prisma.locRegion.create({
      data: { id: region.id, name: region.name, status: RecordStatus.ACTIVE },
    });
    created++;
  }

  console.log(`  ✅ ${regions.length} ta viloyat (Yangi: ${created}, Mavjud: ${skipped})\n`);
}
