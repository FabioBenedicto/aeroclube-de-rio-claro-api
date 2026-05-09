import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Body,
  Param,
  Query,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PERM } from '../common/constants/permissions';
import { FlightsService } from './flights.service';
import { CreateFlightDto } from './dto/create-flight.dto';
import { buildExcel, reportFilename } from '../common/utils/excel.util';
import { ExportThrottle } from '../common/decorators/export-throttle.decorator';
import { MAX_EXPORT_ROWS } from '../common/constants/export.constants';

@ApiTags('flights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get('export')
  @RequirePermission(PERM.FLIGHTS.VIEW)
  @ExportThrottle()
  @ApiOperation({ summary: 'Exportar voos em Excel' })
  async export(
    @Query('plane_id') planeId: string,
    @Query('customer_id') customerId: string,
    @Query('type') type: string,
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
    @Res() res: Response,
  ) {
    const { total } = await this.flightsService.findAll(
      planeId ? Number(planeId) : undefined,
      customerId ? Number(customerId) : undefined,
      type, dateFrom, dateTo, 1, 1,
    );
    if (total > MAX_EXPORT_ROWS) {
      throw new BadRequestException(
        `Existem ${total} registros. Use os filtros para reduzir para no máximo ${MAX_EXPORT_ROWS}.`,
      );
    }
    const { data } = await this.flightsService.findAll(
      planeId ? Number(planeId) : undefined,
      customerId ? Number(customerId) : undefined,
      type, dateFrom, dateTo, 1, total || 1,
    );
    const rows = (data as any[]).map((f) => ({
      id: f.id,
      plane: f.plane?.registration ?? String(f.plane_id),
      customer: f.customer?.name ?? String(f.customer_id),
      type: f.type,
      origin: f.origin,
      destination: f.destination,
      start_date: f.start_date ? new Date(f.start_date).toLocaleDateString('pt-BR') : '',
      end_date: f.end_date ? new Date(f.end_date).toLocaleDateString('pt-BR') : '',
      total_hours: f.total_hours != null ? Number(f.total_hours) : '',
      total_amount: f.total_amount != null ? Number(f.total_amount) : '',
    }));

    const buffer = await buildExcel('Voos', [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Aeronave', key: 'plane', width: 14 },
      { header: 'Cliente', key: 'customer', width: 30 },
      { header: 'Tipo', key: 'type', width: 16 },
      { header: 'Origem', key: 'origin', width: 14 },
      { header: 'Destino', key: 'destination', width: 14 },
      { header: 'Início', key: 'start_date', width: 14 },
      { header: 'Fim', key: 'end_date', width: 14 },
      { header: 'Horas', key: 'total_hours', width: 10 },
      { header: 'Valor (R$)', key: 'total_amount', width: 14 },
    ], rows);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${reportFilename('voos.xlsx')}"`,
    });
    res.send(buffer);
  }

  @Post()
  @RequirePermission(PERM.FLIGHTS.CREATE)
  @ApiOperation({ summary: 'Registrar novo voo e gerar títulos financeiros' })
  @ApiResponse({ status: 201, description: 'Voo registrado com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou aeronave inativa',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  create(@Body() dto: CreateFlightDto) {
    return this.flightsService.registerFlight(dto);
  }

  @Get()
  @RequirePermission(PERM.FLIGHTS.VIEW)
  @ApiOperation({ summary: 'Listar voos' })
  findAll(
    @Query('plane_id') planeId?: string,
    @Query('customer_id') customerId?: string,
    @Query('type') type?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.flightsService.findAll(
      planeId ? Number(planeId) : undefined,
      customerId ? Number(customerId) : undefined,
      type, dateFrom, dateTo, Number(page), Number(limit),
    );
  }

  @Get(':id')
  @RequirePermission(PERM.FLIGHTS.VIEW)
  @ApiOperation({ summary: 'Detalhes do voo' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.flightsService.findOne(id);
  }

  @Patch(':id/close')
  @RequirePermission(PERM.FLIGHTS.UPDATE)
  @ApiOperation({ summary: 'Encerrar voo — calcula horas e gera valor' })
  closeFlight(
    @Param('id', ParseIntPipe) id: number,
    @Body('end_date') endDate: string,
  ) {
    return this.flightsService.closeFlight(id, endDate);
  }

  @Delete(':id')
  @RequirePermission(PERM.FLIGHTS.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover voo' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.flightsService.remove(id);
  }
}
