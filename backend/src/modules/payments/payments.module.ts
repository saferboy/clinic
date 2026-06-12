import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  PaymentsController,
  ClientPaidController,
  OtherPaidGroupsController,
  OtherPaidController,
} from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [
    PaymentsController,
    ClientPaidController,
    OtherPaidGroupsController,
    OtherPaidController,
  ],
  providers: [PaymentsService, RolesGuard, JwtService, ConfigService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
