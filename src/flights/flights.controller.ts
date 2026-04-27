import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Body,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { FlightsService } from './flights.service';
import { CreateFlightDto } from './dto/create-flight.dto';

@ApiTags('flights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.EMPLOYEE)
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
  @ApiOperation({ summary: 'Listar voos' })
  findAll(@Query('status') status?: string) {
    return this.flightsService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do voo' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.flightsService.findOne(id);
  }

  @Patch(':id/close')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Encerrar voo — calcula horas e gera valor' })
  closeFlight(
    @Param('id', ParseIntPipe) id: number,
    @Body('end_date') endDate: string,
  ) {
    return this.flightsService.closeFlight(id, endDate);
  }

  @Patch(':id/cancel')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Cancelar voo' })
  cancelFlight(@Param('id', ParseIntPipe) id: number) {
    return this.flightsService.cancelFlight(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover voo' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.flightsService.remove(id);
  }
}
