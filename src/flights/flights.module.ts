import { Module } from '@nestjs/common';

import { PayableTypesModule } from '../payable-types/payable-types.module';
import { ReceivableTypesModule } from '../receivable-types/receivable-types.module';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { FlightsRepository } from './repository/flights.repository';

@Module({
  imports: [ReceivableTypesModule, PayableTypesModule],
  controllers: [FlightsController],
  providers: [FlightsService, FlightsRepository],
})
export class FlightsModule {}
