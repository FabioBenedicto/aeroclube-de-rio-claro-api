import { Module } from '@nestjs/common';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { BillsRepository } from './bills.repository';

@Module({
  controllers: [BillsController],
  providers: [BillsService, BillsRepository],
})
export class BillsModule {}
