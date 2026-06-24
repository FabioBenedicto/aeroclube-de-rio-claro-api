import {
  Body,
  Controller,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PERMISSIONS } from '../common/constants/permissions';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { QueryReportDto, RawQueryDto } from './dto/query-report.dto';
import { ReportsService } from './reports.service';
import { buildExcel, reportFilename } from './utils/report.utils';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('query')
  @RequirePermission(PERMISSIONS.REPORTS.VIEW)
  @ApiOperation({ summary: 'Execute custom query' })
  query(@Body() dto: QueryReportDto) {
    return this.reportsService.query(dto);
  }

  @Post('query/export')
  @RequirePermission(PERMISSIONS.REPORTS.VIEW)
  @ApiOperation({ summary: 'Export custom query to Excel' })
  async export(@Body() dto: QueryReportDto) {
    const { schema: mergedSchema } = this.reportsService.buildMergedSchema(dto);
    const rows = await this.reportsService.query(dto);

    const keys =
      rows.length > 0
        ? Object.keys(rows[0])
        : dto.groupBy?.length
          ? []
          : (dto.columns ?? []);
    const columns = keys.map((key) => {
      const f = mergedSchema.find((s) => s.key === key);
      return { header: f?.label ?? key, key, width: 24 };
    });

    const buffer = await buildExcel('Report', columns, rows);

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="${reportFilename('report.xlsx')}"`,
    });
  }

  @Post('raw')
  @RequirePermission(PERMISSIONS.REPORTS.VIEW)
  @ApiOperation({ summary: 'Execute raw SQL (SELECT only)' })
  rawQuery(@Body() dto: RawQueryDto) {
    return this.reportsService.rawQuery(dto);
  }

  @Post('raw/export')
  @RequirePermission(PERMISSIONS.REPORTS.VIEW)
  @ApiOperation({ summary: 'Export raw SQL query to Excel' })
  async rawExport(@Body() dto: RawQueryDto) {
    const rows = await this.reportsService.rawQuery(dto);

    const keys = rows.length > 0 ? Object.keys(rows[0]) : [];
    const columns = keys.map((key) => ({ header: key, key, width: 24 }));

    const buffer = await buildExcel('Report', columns, rows);

    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: `attachment; filename="${reportFilename('report-sql.xlsx')}"`,
    });
  }
}
