import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query,
  UseGuards, ParseIntPipe, HttpCode, HttpStatus, Res, BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PERM } from '../common/constants/permissions';
import { PeoplesService } from './peoples.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { buildExcel, reportFilename } from '../common/utils/excel.util';
import { ExportThrottle } from '../common/decorators/export-throttle.decorator';
import { MAX_EXPORT_ROWS } from '../common/constants/export.constants';

const CAT_LABEL: Record<string, string> = {
  instructor: 'Instructor',
  student: 'Student',
  partner: 'Partner',
  employee: 'Employee',
};

@ApiTags('peoples')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('peoples')
export class PeoplesController {
  constructor(private readonly service: PeoplesService) {}

  @Get('export')
  @RequirePermission(PERM.CUSTOMERS.VIEW)
  @ExportThrottle()
  @ApiOperation({ summary: 'Export people to Excel' })
  async export(
    @Query('search') search: string,
    @Query('category') category: string,
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
    @Res() res: Response,
  ) {
    const { total } = await this.service.findAll(search, category, dateFrom, dateTo, 1, 1);
    if (total > MAX_EXPORT_ROWS) {
      throw new BadRequestException(
        `There are ${total} records. Use filters to reduce to at most ${MAX_EXPORT_ROWS}.`,
      );
    }
    const { data } = await this.service.findAll(search, category, dateFrom, dateTo, 1, total || 1);
    const rows = (data as any[]).map((c) => ({
      id: c.id,
      name: c.name,
      cpf: c.cpf ?? '',
      email: c.email ?? '',
      phone: c.phone_number ?? '',
      categories: (c.categories as string[]).map((k) => CAT_LABEL[k] ?? k).join(', '),
      flight_hour_balance: Number(c.flight_hour_balance ?? 0),
    }));

    const buffer = await buildExcel('People', [
      { header: 'ID',           key: 'id',                   width: 10 },
      { header: 'Name',         key: 'name',                 width: 35 },
      { header: 'CPF',          key: 'cpf',                  width: 16 },
      { header: 'E-mail',       key: 'email',                width: 30 },
      { header: 'Phone',        key: 'phone',                width: 18 },
      { header: 'Categories',   key: 'categories',           width: 28 },
      { header: 'Hour balance', key: 'flight_hour_balance',  width: 14 },
    ], rows);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${reportFilename('peoples.xlsx')}"`,
    });
    res.send(buffer);
  }

  @Get()
  @RequirePermission(PERM.CUSTOMERS.VIEW)
  @ApiOperation({ summary: 'List people with categories' })
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.findAll(search, category, dateFrom, dateTo, Number(page), Number(limit));
  }

  @Get('stats')
  @RequirePermission(PERM.CUSTOMERS.VIEW)
  @ApiOperation({ summary: 'People statistics' })
  getStats() {
    return this.service.getStats();
  }

  @Get(':id')
  @RequirePermission(PERM.CUSTOMERS.VIEW)
  @ApiOperation({ summary: 'Person details' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermission(PERM.CUSTOMERS.CREATE)
  @ApiOperation({ summary: 'Create person' })
  create(@Body() dto: CreatePersonDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  @RequirePermission(PERM.CUSTOMERS.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete person' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }

  @Patch(':id')
  @RequirePermission(PERM.CUSTOMERS.UPDATE)
  @ApiOperation({ summary: 'Update person' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonDto,
  ) {
    return this.service.update(id, dto);
  }
}
