import { Module } from '@nestjs/common';

import { PayableTypesController } from './payable-types.controller';
import { PayableTypesService } from './payable-types.service';
import { PayableTypesRepository } from './repository/payable-types.repository';
import { PAYABLE_TYPES_REPOSITORY } from './repository/payable-types-repository.interface';

@Module({
  controllers: [PayableTypesController],
  providers: [
    PayableTypesService,
    {
      provide: PAYABLE_TYPES_REPOSITORY,
      useClass: PayableTypesRepository,
    },
  ],
  exports: [PayableTypesService],
})
export class PayableTypesModule {}
