import { Module } from '@nestjs/common';

import { ReceivableTypesController } from './receivable-types.controller';
import { ReceivableTypesService } from './receivable-types.service';
import { ReceivableTypesRepository } from './repository/receivable-types.repository';
import { RECEIVABLE_TYPES_REPOSITORY } from './repository/receivable-types-repository.interface';

@Module({
  controllers: [ReceivableTypesController],
  providers: [
    ReceivableTypesService,
    {
      provide: RECEIVABLE_TYPES_REPOSITORY,
      useClass: ReceivableTypesRepository,
    },
  ],
  exports: [ReceivableTypesService],
})
export class ReceivableTypesModule {}
