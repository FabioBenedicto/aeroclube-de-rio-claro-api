import { Module } from '@nestjs/common';
import { PeoplesController } from './peoples.controller';
import { PeoplesService } from './peoples.service';
import { PeoplesRepository } from './peoples.repository';

@Module({
  controllers: [PeoplesController],
  providers: [PeoplesService, PeoplesRepository],
})
export class PeoplesModule {}
