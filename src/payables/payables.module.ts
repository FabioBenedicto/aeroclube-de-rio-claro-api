import { Module } from '@nestjs/common';

import { PayablesController } from './payables.controller';
import { PayablesService } from './payables.service';
import { PAYABLES_REPOSITORY } from './repository/payables-repository.interface';
import { PayablesRepository } from './repository/payables.repository';

@Module({
  controllers: [PayablesController],
  providers: [PayablesService, { provide: PAYABLES_REPOSITORY, useClass: PayablesRepository }],
})
export class PayablesModule {}
