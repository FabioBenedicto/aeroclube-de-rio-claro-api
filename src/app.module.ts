import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from './config/jwt.config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FlightsModule } from './flights/flights.module';
import { ReceivablesModule } from './receivables/receivables.module';
import { PlanesModule } from './planes/planes.module';
import { CustomersModule } from './customers/customers.module';
import { PayablesModule } from './payables/payables.module';
import { InvoicesModule } from './invoices/invoices.module';
import { CreditsModule } from './credits/credits.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [jwtConfig] }),
    PrismaModule,
    AuthModule,
    FlightsModule,
    ReceivablesModule,
    PlanesModule,
    CustomersModule,
    PayablesModule,
    InvoicesModule,
    CreditsModule,
    DashboardModule,
  ],
})
export class AppModule {}
