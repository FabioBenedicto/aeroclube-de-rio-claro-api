import { Module } from '@nestjs/common';

import { ReceivablesController } from './receivables.controller';
import { ReceivablesService } from './receivables.service';
import { ReceivablesRepository } from './repository/receivables.repository';
import { RECEIVABLES_REPOSITORY } from './repository/receivables-repository.interface';

@Module({
  controllers: [ReceivablesController],
  providers: [
    ReceivablesService,
    {
      provide: RECEIVABLES_REPOSITORY,
      useClass: ReceivablesRepository,
    },
  ],
})
export class ReceivablesModule {}
