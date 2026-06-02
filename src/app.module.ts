import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { jwtConfig } from './config/jwt.config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FlightsModule } from './flights/flights.module';
import { ReceivablesModule } from './receivables/receivables.module';
import { PlanesModule } from './planes/planes.module';
import { CustomersModule } from './customers/customers.module';
import { PayablesModule } from './payables/payables.module';
import { BillsModule } from './bills/bills.module';
import { CreditsModule } from './credits/credits.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SettingsModule } from './settings/settings.module';
import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { CnabModule } from './cnab/cnab.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [jwtConfig] }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    FlightsModule,
    ReceivablesModule,
    PlanesModule,
    CustomersModule,
    PayablesModule,
    BillsModule,
    CreditsModule,
    DashboardModule,
    SettingsModule,
    CompaniesModule,
    UsersModule,
    ReportsModule,
    CnabModule,
    InvoicesModule,
  ],
})
export class AppModule {}
