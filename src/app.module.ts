import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FlightsModule } from './flights/flights.module';
import { ReceivablesModule } from './receivables/receivables.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    FlightsModule,
    ReceivablesModule,
  ],
})
export class AppModule {}
