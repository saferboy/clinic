import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ClinicSettingsService } from './clinic-settings.service';
import { UpdateClinicSettingsDto } from './dto/update-clinic-settings.dto';

@ApiTags('clinic-settings')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('clinic-settings')
export class ClinicSettingsController {
  constructor(private readonly clinicSettingsService: ClinicSettingsService) {}

  @Get()
  get() {
    return this.clinicSettingsService.get();
  }

  @Patch()
  update(@Body() dto: UpdateClinicSettingsDto) {
    return this.clinicSettingsService.update(dto);
  }
}
