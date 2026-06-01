import { Module } from '@nestjs/common';
import { CnabController } from './cnab.controller';
import { CnabService } from './cnab.service';
import { CnabRepository } from './cnab.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CnabController],
  providers: [CnabService, CnabRepository],
})
export class CnabModule {}
