import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateClinicSettingsDto } from './dto/update-clinic-settings.dto';

const DEFAULT_SETTINGS = {
  id: 1,
  name: 'MedClinic',
  tin: null,
  address: null,
  phone: null,
  email: null,
  website: null,
  work_start: '08:00',
  work_end: '18:00',
  logo_url: null,
};

@Injectable()
export class ClinicSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    let settings = await this.prisma.clinicSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      settings = await this.prisma.clinicSettings.create({
        data: DEFAULT_SETTINGS,
      });
    }

    return {
      success: true,
      message: 'Klinika sozlamalari olindi',
      data: settings,
    };
  }

  async update(dto: UpdateClinicSettingsDto) {
    const settings = await this.prisma.clinicSettings.upsert({
      where: { id: 1 },
      update: { ...dto, updated_at: new Date() },
      create: { ...DEFAULT_SETTINGS, ...dto, id: 1 },
    });

    return {
      success: true,
      message: 'Klinika sozlamalari saqlandi',
      data: settings,
    };
  }
}
