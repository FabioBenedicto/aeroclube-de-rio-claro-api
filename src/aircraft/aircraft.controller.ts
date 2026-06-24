import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
import { AircraftService } from './aircraft.service';
import { CreateAircraftDto } from './dto/create-aircraft.dto';
import { FindAllAircraftDto } from './dto/find-all-aircraft.dto';
import { UpdateAircraftDto } from './dto/update-aircraft.dto';
import { Aircraft } from './model/aircraft.model';

@ApiTags('aircraft')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('aircraft')
export class AircraftController {
  constructor(private readonly aircraftService: AircraftService) {}

  @Get()
  @RequirePermission(PERMISSIONS.AIRCRAFT.VIEW)
  @ApiOperation({ summary: 'List aircraft' })
  @ApiResponse({ type: PaginatedResponse(Aircraft) })
  findAll(@Query() query: FindAllAircraftDto) {
    return this.aircraftService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.AIRCRAFT.VIEW)
  @ApiOperation({ summary: 'Get aircraft' })
  @ApiResponse({ type: Aircraft })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.aircraftService.findOne(id);
  }

  @Post()
  @RequirePermission(PERMISSIONS.AIRCRAFT.CREATE)
  @ApiOperation({ summary: 'Create aircraft' })
  @ApiResponse({ type: Aircraft })
  create(@Body() dto: CreateAircraftDto) {
    return this.aircraftService.create(dto);
  }

  @Put(':id')
  @RequirePermission(PERMISSIONS.AIRCRAFT.UPDATE)
  @ApiOperation({ summary: 'Update aircraft' })
  @ApiResponse({ type: Aircraft })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAircraftDto,
  ) {
    return this.aircraftService.update(id, dto);
  }

  @Delete('bulk')
  @RequirePermission(PERMISSIONS.AIRCRAFT.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk delete aircraft' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  bulkDelete(@Body() dto: BulkDeleteDto) {
    return this.aircraftService.bulkDelete(dto.ids);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.AIRCRAFT.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete aircraft' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.aircraftService.delete(id);
  }
}
