import { Module } from '@nestjs/common';

import { PeoplesController } from './peoples.controller';
import { PeoplesService } from './peoples.service';
import { PeoplesRepository } from './repository/peoples/peoples.repository';
import { PEOPLES_REPOSITORY } from './repository/peoples/peoples-repository.interface';

@Module({
  controllers: [PeoplesController],
  providers: [
    PeoplesService,
    {
      provide: PEOPLES_REPOSITORY,
      useClass: PeoplesRepository,
    },
  ],
})
export class PeoplesModule {}
