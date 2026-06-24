import { Module } from '@nestjs/common';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DASHBOARD_REPOSITORY } from './repository/dashboard-repository.interface';
import { DashboardRepository } from './repository/dashboard.repository';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, { provide: DASHBOARD_REPOSITORY, useClass: DashboardRepository }],
})
export class DashboardModule {}
