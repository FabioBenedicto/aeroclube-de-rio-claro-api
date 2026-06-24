import { Module } from '@nestjs/common';

import { AircraftController } from './aircraft.controller';
import { AircraftService } from './aircraft.service';
import { AircraftRepository } from './repository/aircraft.repository';
import { AIRCRAFT_REPOSITORY } from './repository/aircraft-repository.interface';

@Module({
  controllers: [AircraftController],
  providers: [
    AircraftService,
    {
      provide: AIRCRAFT_REPOSITORY,
      useClass: AircraftRepository,
    },
  ],
})
export class AircraftModule {}
