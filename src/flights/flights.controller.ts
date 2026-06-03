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
import { UpdateFlightDto } from './dto/update-flight.dto';
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
  @ApiOperation({ summary: 'Export flights to Excel' })
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
        `There are ${total} records. Use filters to reduce to at most ${MAX_EXPORT_ROWS}.`,
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

    const buffer = await buildExcel('Flights', [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Plane', key: 'plane', width: 14 },
      { header: 'Customer', key: 'customer', width: 30 },
      { header: 'Type', key: 'type', width: 16 },
      { header: 'Origin', key: 'origin', width: 14 },
      { header: 'Destination', key: 'destination', width: 14 },
      { header: 'Start', key: 'start_date', width: 14 },
      { header: 'End', key: 'end_date', width: 14 },
      { header: 'Hours', key: 'total_hours', width: 10 },
      { header: 'Amount (R$)', key: 'total_amount', width: 14 },
    ], rows);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${reportFilename('flights.xlsx')}"`,
    });
    res.send(buffer);
  }

  @Post()
  @RequirePermission(PERM.FLIGHTS.CREATE)
  @ApiOperation({ summary: 'Register new flight and generate financial records' })
  @ApiResponse({ status: 201, description: 'Flight registered successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or inactive plane',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  create(@Body() dto: CreateFlightDto) {
    return this.flightsService.registerFlight(dto);
  }

  @Get()
  @RequirePermission(PERM.FLIGHTS.VIEW)
  @ApiOperation({ summary: 'List flights' })
  findAll(
    @Query('plane_id') planeId?: string,
    @Query('customer_id') customerId?: string,
    @Query('instructor_id') instructorId?: string,
    @Query('type') type?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {
    return this.flightsService.findAll(
      planeId ? Number(planeId) : undefined,
      customerId ? Number(customerId) : undefined,
      type, dateFrom, dateTo, Number(page), Number(limit), search,
      instructorId ? Number(instructorId) : undefined,
    );
  }

  @Get(':id')
  @RequirePermission(PERM.FLIGHTS.VIEW)
  @ApiOperation({ summary: 'Get flight details' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.flightsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission(PERM.FLIGHTS.UPDATE)
  @ApiOperation({ summary: 'Update flight data' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlightDto,
  ) {
    return this.flightsService.update(id, dto);
  }

  @Patch(':id/close')
  @RequirePermission(PERM.FLIGHTS.UPDATE)
  @ApiOperation({ summary: 'Close flight — calculates hours and generates amount' })
  closeFlight(
    @Param('id', ParseIntPipe) id: number,
    @Body('end_date') endDate: string,
  ) {
    return this.flightsService.closeFlight(id, endDate);
  }

  @Delete(':id')
  @RequirePermission(PERM.FLIGHTS.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete flight' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.flightsService.remove(id);
  }
}
