import { Module } from '@nestjs/common';

import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { BillsRepository } from './repository/bills.repository';
import { BILLS_REPOSITORY } from './repository/bills-repository.interface';

@Module({
  controllers: [BillsController],
  providers: [
    BillsService,
    {
      provide: BILLS_REPOSITORY,
      useClass: BillsRepository,
    },
  ],
  exports: [BILLS_REPOSITORY],
})
export class BillsModule {}
