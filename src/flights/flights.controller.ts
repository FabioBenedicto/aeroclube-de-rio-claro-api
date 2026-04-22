import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  @ApiResponse({ status: 400, description: 'Dados inválidos ou aeronave inativa' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  create(@Body() dto: CreateFlightDto) {
    return this.flightsService.registerFlight(dto);
  }
}
