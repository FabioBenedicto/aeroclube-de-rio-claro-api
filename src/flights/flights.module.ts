import { Module } from '@nestjs/common';

import { PayableTypesModule } from '../payable-types/payable-types.module';
import { ReceivableTypesModule } from '../receivable-types/receivable-types.module';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { FlightsRepository } from './repository/flights.repository';
import { FLIGHTS_REPOSITORY } from './repository/flights-repository.interface';

@Module({
  imports: [ReceivableTypesModule, PayableTypesModule],
  controllers: [FlightsController],
  providers: [
    FlightsService,
    {
      provide: FLIGHTS_REPOSITORY,
      useClass: FlightsRepository,
    },
  ],
})
export class FlightsModule {}
