import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserRolesController } from './user-roles.controller';
import { UserRolesService } from './user-roles.service';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  controllers: [UserRolesController],
  providers: [UserRolesService, RolesGuard, JwtService, ConfigService],
  imports: [PrismaModule],
})
export class UserRolesModule {}

