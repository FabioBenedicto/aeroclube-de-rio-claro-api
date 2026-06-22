import { Module } from '@nestjs/common';

import { ReceivableTypesController } from './receivable-types.controller';
import { ReceivableTypesService } from './receivable-types.service';
import { ReceivableTypesRepository } from './repository/receivable-types.repository';

@Module({
  controllers: [ReceivableTypesController],
  providers: [ReceivableTypesService, ReceivableTypesRepository],
  exports: [ReceivableTypesService],
})
export class ReceivableTypesModule {}
