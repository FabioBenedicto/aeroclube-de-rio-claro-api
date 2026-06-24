import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

import {
  DashboardData,
  IDashboardRepository,
} from './dashboard-repository.interface';

type RawRow = {
  totalReceivables: Prisma.Decimal;
  openReceivables: Prisma.Decimal;
  totalPayables: Prisma.Decimal;
  openPayables: Prisma.Decimal;
  flightsToday: bigint;
  inFlight: bigint;
  activePeople: bigint;
};

@Injectable()
export class DashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSummaryData(): Promise<DashboardData> {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const [row] = await this.prisma.$queryRaw<RawRow[]>`
      SELECT
        (SELECT COALESCE(SUM(total_amount), 0) FROM receivables)                              AS "totalReceivables",
        (SELECT COALESCE(SUM(total_amount), 0) FROM receivables WHERE status = 'PENDING')     AS "openReceivables",
        (SELECT COALESCE(SUM(total_amount), 0) FROM payables)                                 AS "totalPayables",
        (SELECT COALESCE(SUM(total_amount), 0) FROM payables   WHERE status = 'PENDING')      AS "openPayables",
        (SELECT COUNT(*) FROM flights WHERE start_date >= ${startOfToday})                    AS "flightsToday",
        (SELECT COUNT(*) FROM flights WHERE end_date IS NULL)                                 AS "inFlight",
        (SELECT COUNT(*) FROM peoples)                                                        AS "activePeople"
    `;

    return {
      totalReceivables: row.totalReceivables.toNumber(),
      openReceivables: row.openReceivables.toNumber(),
      totalPayables: row.totalPayables.toNumber(),
      openPayables: row.openPayables.toNumber(),
      flightsToday: Number(row.flightsToday),
      inFlight: Number(row.inFlight),
      activePeople: Number(row.activePeople),
    };
  }
}
