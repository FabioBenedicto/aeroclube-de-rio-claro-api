import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, ParseIntPipe, HttpCode, HttpStatus, Res, BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PERM } from '../common/constants/permissions';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { buildExcel, reportFilename } from '../common/utils/excel.util';
import { ExportThrottle } from '../common/decorators/export-throttle.decorator';
import { MAX_EXPORT_ROWS } from '../common/constants/export.constants';

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('export')
  @RequirePermission(PERM.COMPANIES.VIEW)
  @ExportThrottle()
  async export(
    @Query('search') search: string,
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
    @Res() res: Response,
  ) {
    const { total } = await this.companiesService.findAll(search, dateFrom, dateTo, 1, 1);
    if (total > MAX_EXPORT_ROWS) {
      throw new BadRequestException(
        `Existem ${total} registros. Use os filtros para reduzir para no máximo ${MAX_EXPORT_ROWS}.`,
      );
    }
    const { data } = await this.companiesService.findAll(search, dateFrom, dateTo, 1, total || 1);
    const rows = (data as any[]).map((c) => ({
      id: c.id,
      name: c.name,
      cnpj: c.cnpj ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
    }));

    const buffer = await buildExcel('Empresas', [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nome', key: 'name', width: 35 },
      { header: 'CNPJ', key: 'cnpj', width: 20 },
      { header: 'E-mail', key: 'email', width: 30 },
      { header: 'Telefone', key: 'phone', width: 18 },
    ], rows);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${reportFilename('empresas.xlsx')}"`,
    });
    res.send(buffer);
  }

  @Get()
  @RequirePermission(PERM.COMPANIES.VIEW)
  findAll(
    @Query('search') search?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.companiesService.findAll(search, dateFrom, dateTo, Number(page), Number(limit));
  }

  @Get(':id')
  @RequirePermission(PERM.COMPANIES.VIEW)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.findOne(id);
  }

  @Post()
  @RequirePermission(PERM.COMPANIES.CREATE)
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Patch(':id')
  @RequirePermission(PERM.COMPANIES.UPDATE)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission(PERM.COMPANIES.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.delete(id);
  }
}
