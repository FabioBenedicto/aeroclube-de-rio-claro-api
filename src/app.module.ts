import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AircraftModule } from './aircraft/aircraft.module';
import { AuthModule } from './auth/auth.module';
import { BillsModule } from './bills/bills.module';
import { CnabModule } from './cnab/cnab.module';
import { AzureBlobModule } from './common/providers/azure-blob.module';
import { CompaniesModule } from './companies/companies.module';
import { jwtConfig } from './common/config/jwt.config';
import { DashboardModule } from './dashboard/dashboard.module';
import { FlightsModule } from './flights/flights.module';
import { PayablesModule } from './payables/payables.module';
import { PeoplesModule } from './peoples/peoples.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReceivablesModule } from './receivables/receivables.module';
import { PayableTypesModule } from './payable-types/payable-types.module';
import { ReceivableTypesModule } from './receivable-types/receivable-types.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [jwtConfig] }),
    AzureBlobModule,
    PrismaModule,
    AuthModule,
    FlightsModule,
    ReceivablesModule,
    AircraftModule,
    PeoplesModule,
    PayablesModule,
    BillsModule,
    DashboardModule,
    SettingsModule,
    CompaniesModule,
    UsersModule,
    ReportsModule,
    CnabModule,
    ReceivableTypesModule,
    PayableTypesModule,
  ],
})
export class AppModule {}
