import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  Put,
  Delete,
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
import { PlanesService } from './planes.service';
import { CreatePlaneDto } from './dto/create-plane.dto';
import { UpdatePlaneDto } from './dto/update-plane.dto';
import { buildExcel, reportFilename } from '../common/utils/excel.util';
import { ExportThrottle } from '../common/decorators/export-throttle.decorator';
import { MAX_EXPORT_ROWS } from '../common/constants/export.constants';


@ApiTags('planes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('planes')
export class PlanesController {
  constructor(private readonly planesService: PlanesService) {}

  @Get('export')
  @RequirePermission(PERM.PLANES.VIEW)
  @ExportThrottle()
  @ApiOperation({ summary: 'Exportar aeronaves em Excel' })
  async export(
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
    @Res() res: Response,
  ) {
    const { total } = await this.planesService.findAll(1, 1, dateFrom, dateTo);
    if (total > MAX_EXPORT_ROWS) {
      throw new BadRequestException(
        `Existem ${total} registros. Use os filtros para reduzir para no máximo ${MAX_EXPORT_ROWS}.`,
      );
    }
    const { data } = await this.planesService.findAll(1, total || 1, dateFrom, dateTo);
    const rows = (data as any[]).map((p) => ({
      id: p.id,
      registration: p.registration,
      model: p.model ?? '',
      flight_hour_value: Number(p.flight_hour_value),
      created_at: p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '',
    }));

    const buffer = await buildExcel('Aeronaves', [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Matrícula', key: 'registration', width: 14 },
      { header: 'Modelo', key: 'model', width: 25 },
      { header: 'Valor/h (R$)', key: 'flight_hour_value', width: 16 },
      { header: 'Cadastro', key: 'created_at', width: 16 },
    ], rows);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${reportFilename('aeronaves.xlsx')}"`,
    });
    res.send(buffer);
  }

  @Get()
  @RequirePermission(PERM.PLANES.VIEW)
  @ApiOperation({ summary: 'Listar aeronaves' })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
  ) {
    return this.planesService.findAll(Number(page), Number(limit), dateFrom, dateTo);
  }

  @Get(':id')
  @RequirePermission(PERM.PLANES.VIEW)
  @ApiOperation({ summary: 'Detalhes da aeronave' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.planesService.findOne(id);
  }

  @Post()
  @RequirePermission(PERM.PLANES.CREATE)
  @ApiOperation({ summary: 'Cadastrar aeronave' })
  create(@Body() dto: CreatePlaneDto) {
    return this.planesService.create(dto);
  }

  @Put(':id')
  @RequirePermission(PERM.PLANES.UPDATE)
  @ApiOperation({ summary: 'Atualizar aeronave' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlaneDto) {
    return this.planesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission(PERM.PLANES.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir aeronave' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.planesService.delete(id);
  }
}
