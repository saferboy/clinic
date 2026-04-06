import { RecordStatus } from '@prisma/client';
import { prisma } from './db';

export async function seedDepartments() {
  console.log('🏢 Departamentlar yaratilmoqda...');

  const departments = ['Terapiya', 'Xirurgiya', 'Pediatr', 'Kardiologiya', 'Nevrologiya'];

  for (const dept of departments) {
    const existing = await prisma.department.findFirst({ where: { name: dept } });
    if (existing) {
      await prisma.department.update({
        where: { id: existing.id },
        data: { status: RecordStatus.ACTIVE },
      });
    } else {
      await prisma.department.create({
        data: { name: dept, status: RecordStatus.ACTIVE },
      });
    }
  }

  console.log(`  ✅ ${departments.length} ta departament yaratildi\n`);
}
