import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { GetBirthdayReportDto } from './dto/get-birthday-report.dto';

@Injectable()
export class BirthdayReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getBirthdayReport(dto: GetBirthdayReportDto) {
    const daysAhead = dto.days_ahead ?? 30;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const clients = await this.prisma.client.findMany({
      where: {
        deleted_at: null,
        status: 'ACTIVE',
        date_of_birth: { not: null },
      },
      select: {
        id: true,
        full_name: true,
        phone: true,
        date_of_birth: true,
        gender: true,
      },
    });

    const upcoming = clients
      .filter((c) => c.date_of_birth !== null)
      .map((c) => {
        const bday = new Date(c.date_of_birth!);
        const thisYear = new Date(
          today.getFullYear(),
          bday.getMonth(),
          bday.getDate(),
        );
        if (thisYear < today) {
          thisYear.setFullYear(today.getFullYear() + 1);
        }
        const daysUntil = Math.floor(
          (thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        const turnsAge =
          thisYear.getFullYear() - bday.getFullYear();

        return {
          clientId: c.id,
          fullName: c.full_name,
          phone: c.phone,
          gender: c.gender,
          dateOfBirth: c.date_of_birth,
          daysUntilBirthday: daysUntil,
          turnsAge,
          birthdayDate: thisYear.toISOString().split('T')[0],
        };
      })
      .filter((c) => c.daysUntilBirthday <= daysAhead)
      .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);

    return {
      daysAhead,
      total: upcoming.length,
      todayCount: upcoming.filter((c) => c.daysUntilBirthday === 0).length,
      thisWeekCount: upcoming.filter(
        (c) => c.daysUntilBirthday > 0 && c.daysUntilBirthday <= 7,
      ).length,
      clients: upcoming,
    };
  }
}
