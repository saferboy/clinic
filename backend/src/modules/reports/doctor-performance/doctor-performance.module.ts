import { Module } from '@nestjs/common';
import { DoctorPerformanceService } from './doctor-performance.service';
import { DoctorPerformanceController } from './doctor-performance.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DoctorPerformanceController],
  providers: [DoctorPerformanceService],
  exports: [DoctorPerformanceService],
})
export class DoctorPerformanceModule {}
