import { Module } from '@nestjs/common';

import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { CompaniesRepository } from './repository/companies.repository';
import { COMPANIES_REPOSITORY } from './repository/companies-repository.interface';

@Module({
  controllers: [CompaniesController],
  providers: [
    CompaniesService,
    {
      provide: COMPANIES_REPOSITORY,
      useClass: CompaniesRepository,
    },
  ],
})
export class CompaniesModule {}
