import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PERM } from '../common/constants/permissions';
import { ReportsService } from './reports.service';
import { QueryReportDto, RawQueryDto } from './dto/query-report.dto';
import { buildExcel, reportFilename } from '../common/utils/excel.util';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('query')
  @RequirePermission(PERM.REPORTS.VIEW)
  @ApiOperation({ summary: 'Execute custom query' })
  query(@Body() dto: QueryReportDto) {
    return this.reportsService.query(dto);
  }

  @Post('query/export')
  @RequirePermission(PERM.REPORTS.VIEW)
  @ApiOperation({ summary: 'Export custom query to Excel' })
  async export(@Body() dto: QueryReportDto, @Res() res: Response) {
    const { schema: mergedSchema } = this.reportsService.buildMergedSchema(dto);
    const rows = await this.reportsService.query(dto);
    const keys = rows.length > 0 ? Object.keys(rows[0]) : (dto.groupBy?.length ? [] : dto.columns);
    const columns = keys.map(key => {
      const f = mergedSchema.find(s => s.key === key);
      return { header: f?.label ?? key, key, width: 24 };
    });
    const buffer = await buildExcel('Report', columns, rows as Record<string, unknown>[]);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${reportFilename('report.xlsx')}"`,
    });
    res.send(buffer);
  }

  @Post('raw')
  @RequirePermission(PERM.REPORTS.VIEW)
  @ApiOperation({ summary: 'Execute raw SQL (SELECT only)' })
  rawQuery(@Body() dto: RawQueryDto) {
    return this.reportsService.rawQuery(dto);
  }

  @Post('raw/export')
  @RequirePermission(PERM.REPORTS.VIEW)
  @ApiOperation({ summary: 'Export raw SQL query to Excel' })
  async rawExport(@Body() dto: RawQueryDto, @Res() res: Response) {
    const rows = await this.reportsService.rawQuery(dto);
    const keys = rows.length > 0 ? Object.keys(rows[0]) : [];
    const columns = keys.map(key => ({ header: key, key, width: 24 }));
    const buffer = await buildExcel('Report', columns, rows as Record<string, unknown>[]);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${reportFilename('report-sql.xlsx')}"`,
    });
    res.send(buffer);
  }
}
