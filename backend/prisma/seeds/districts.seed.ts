import { RecordStatus } from '@prisma/client';
import { prisma } from './db';
import * as fs from 'fs';
import * as path from 'path';

export async function seedDistricts() {
  console.log('📍 Tumanlar yaratilmoqda...');

  const locationDataPath = path.join(__dirname, 'location.json');
  const locationData = JSON.parse(fs.readFileSync(locationDataPath, 'utf-8'));
  const districts = locationData.districts;

  let created = 0;
  let skipped = 0;

  for (const district of districts) {
    const existing = await prisma.locDistrict.findFirst({
      where: { name: district.name, region_id: district.region_id },
    });

    if (!existing) {
      await prisma.locDistrict.create({
        data: { name: district.name, region_id: district.region_id, status: RecordStatus.ACTIVE },
      });
      created++;
    } else {
      skipped++;
    }
  }

  console.log(`  ✅ ${districts.length} ta tuman yuklandi (Yangi: ${created}, O'tkazib yuborilgan: ${skipped})\n`);
}
