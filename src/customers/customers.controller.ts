import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PERM } from '../common/constants/permissions';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { buildExcel, reportFilename } from '../common/utils/excel.util';
import { ExportThrottle } from '../common/decorators/export-throttle.decorator';
import { MAX_EXPORT_ROWS } from '../common/constants/export.constants';

const CAT_LABEL: Record<string, string> = { aluno: 'Aluno', socio: 'Sócio', instrutor: 'Instrutor', funcionario: 'Funcionário' };

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('pessoas')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('export')
  @RequirePermission(PERM.CUSTOMERS.VIEW)
  @ExportThrottle()
  @ApiOperation({ summary: 'Exportar clientes em Excel' })
  async export(
    @Query('search') search: string,
    @Query('category') category: string,
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
    @Res() res: Response,
  ) {
    const { total } = await this.customersService.findAll(search, category, dateFrom, dateTo, 1, 1);
    if (total > MAX_EXPORT_ROWS) {
      throw new BadRequestException(
        `Existem ${total} registros. Use os filtros para reduzir para no máximo ${MAX_EXPORT_ROWS}.`,
      );
    }
    const { data } = await this.customersService.findAll(search, category, dateFrom, dateTo, 1, total || 1);
    const rows = (data as any[]).map((c) => ({
      id: c.id,
      name: c.name,
      cpf: c.cpf ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
      categories: (c.categories as string[]).map((k) => CAT_LABEL[k] ?? k).join(', '),
      flight_hour_balance: Number(c.flight_hour_balance ?? 0),
    }));

    const buffer = await buildExcel('Clientes', [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nome', key: 'name', width: 35 },
      { header: 'CPF', key: 'cpf', width: 16 },
      { header: 'E-mail', key: 'email', width: 30 },
      { header: 'Telefone', key: 'phone', width: 18 },
      { header: 'Categorias', key: 'categories', width: 28 },
      { header: 'Saldo horas', key: 'flight_hour_balance', width: 14 },
    ], rows);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${reportFilename('clientes.xlsx')}"`,
    });
    res.send(buffer);
  }

  @Get()
  @RequirePermission(PERM.CUSTOMERS.VIEW)
  @ApiOperation({ summary: 'Listar clientes com categorias' })
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.customersService.findAll(search, category, dateFrom, dateTo, Number(page), Number(limit));
  }

  @Get(':id')
  @RequirePermission(PERM.CUSTOMERS.VIEW)
  @ApiOperation({ summary: 'Detalhes do cliente' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  @Post()
  @RequirePermission(PERM.CUSTOMERS.CREATE)
  @ApiOperation({ summary: 'Cadastrar cliente' })
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Delete(':id')
  @RequirePermission(PERM.CUSTOMERS.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir cliente' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.delete(id);
  }

  @Patch(':id')
  @RequirePermission(PERM.CUSTOMERS.UPDATE)
  @ApiOperation({ summary: 'Atualizar cliente' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, dto);
  }
}
