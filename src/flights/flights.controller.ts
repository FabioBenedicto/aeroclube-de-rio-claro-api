import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PERMISSIONS } from '../common/constants/permissions';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { BulkDeleteDto } from '../common/dto/bulk-delete.dto';
import { PaginatedResponse } from '../common/swagger/paginated-response';
import { CreateFlightDto } from './dto/create-flight.dto';
import { FindAllFlightsDto } from './dto/find-all-flights.dto';
import { UpdateFlightDto } from './dto/update-flight.dto';
import { FlightsService } from './flights.service';
import { Flight } from './model/flight.model';

@ApiTags('flights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  @RequirePermission(PERMISSIONS.FLIGHTS.VIEW)
  @ApiOperation({ summary: 'List flights' })
  @ApiResponse({ type: PaginatedResponse(Flight) })
  findAll(@Query() query: FindAllFlightsDto) {
    return this.flightsService.findAll(query);
  }

  @Get('stats')
  @RequirePermission(PERMISSIONS.FLIGHTS.VIEW)
  @ApiOperation({ summary: 'Get flight stats (total count and total hours)' })
  getStats(@Query() query: FindAllFlightsDto) {
    return this.flightsService.getStats(query);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.FLIGHTS.VIEW)
  @ApiOperation({ summary: 'Get flight' })
  @ApiResponse({ type: Flight })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.flightsService.findOne(id);
  }

  @Post()
  @RequirePermission(PERMISSIONS.FLIGHTS.CREATE)
  @ApiOperation({
    summary: 'Create flight and financial titles',
  })
  @ApiResponse({ type: Flight })
  create(@Body() dto: CreateFlightDto) {
    return this.flightsService.registerFlight(dto);
  }

  @Patch(':id')
  @RequirePermission(PERMISSIONS.FLIGHTS.UPDATE)
  @ApiOperation({ summary: 'Update flight and financial titles' })
  @ApiResponse({ type: Flight })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFlightDto) {
    return this.flightsService.update(id, dto);
  }

  @Delete('bulk')
  @RequirePermission(PERMISSIONS.FLIGHTS.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk delete flights' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  bulkRemove(@Body() dto: BulkDeleteDto) {
    return this.flightsService.bulkRemove(dto.ids);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.FLIGHTS.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete flight financial titles' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.flightsService.remove(id);
  }
}
