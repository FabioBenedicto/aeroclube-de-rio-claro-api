import { Module } from '@nestjs/common';

import { BillsModule } from '../bills/bills.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SettingsModule } from '../settings/settings.module';
import { CnabController } from './cnab.controller';
import { CnabService } from './cnab.service';
import { CNAB_REPOSITORY } from './repository/cnab-repository.interface';
import { CnabRepository } from './repository/cnab.repository';

@Module({
  imports: [PrismaModule, BillsModule, SettingsModule],
  controllers: [CnabController],
  providers: [CnabService, { provide: CNAB_REPOSITORY, useClass: CnabRepository }],
})
export class CnabModule {}
