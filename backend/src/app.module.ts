import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserRolesModule } from './modules/user-roles/user-roles.module';
import { UsersModule } from './modules/users/users.module';
import { RegionsModule } from './modules/regions/regions.module';
import { DistrictsModule } from './modules/districts/districts.module';
import { SourcesModule } from './modules/sources/sources.module';
import { ClientGroupsModule } from './modules/client-groups/client-groups.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { ClientsModule } from './modules/clients/clients.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { ServicesModule } from './modules/services/services.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { VisitsModule } from './modules/visits/visits.module';
import { DailyReportModule } from './modules/reports/daily/daily-report.module';
import { MonthlyReportModule } from './modules/reports/monthly/monthly-report.module';
import { DebtReportModule } from './modules/reports/debt/debt-report.module';
import { ClientReportModule } from './modules/reports/client/client-report.module';
import { ServiceReportModule } from './modules/reports/service/service-report.module';
import { DoctorPerformanceModule } from './modules/reports/doctor-performance/doctor-performance.module';
import { DashboardModule } from './modules/reports/dashboard/dashboard.module';
import { ClinicSettingsModule } from './modules/clinic-settings/clinic-settings.module';
import { IsUniqueConstraint } from './common/validators/is-unique.validator';
import { SanitizationInterceptor } from './common/interceptors/sanitization.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    PrismaModule,
    AuthModule,
    UserRolesModule,
    UsersModule,
    RegionsModule,
    DistrictsModule,
    SourcesModule,
    ClientGroupsModule,
    DepartmentsModule,
    ClientsModule,
    RoomsModule,
    ServicesModule,
    ReferralsModule,
    VisitsModule,
    // Reports Modules (Phase 3)
    DailyReportModule,
    MonthlyReportModule,
    DebtReportModule,
    ClientReportModule,
    ServiceReportModule,
    DoctorPerformanceModule,
    DashboardModule,
    ClinicSettingsModule,
  ],
  controllers: [AppController],
  providers: [
    IsUniqueConstraint,
    {
      provide: APP_INTERCEPTOR,
      useClass: SanitizationInterceptor,
    },
  ],
})
export class AppModule {}
