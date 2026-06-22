import { Module } from '@nestjs/common';

import { PayableTypesController } from './payable-types.controller';
import { PayableTypesService } from './payable-types.service';
import { PayableTypesRepository } from './repository/payable-types.repository';

@Module({
  controllers: [PayableTypesController],
  providers: [PayableTypesService, PayableTypesRepository],
  exports: [PayableTypesService],
})
export class PayableTypesModule {}
