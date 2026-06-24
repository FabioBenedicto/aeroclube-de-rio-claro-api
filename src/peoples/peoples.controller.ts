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
import { CreatePeopleDto } from './dto/create-people.dto';
import { FindAllPeoplesDto } from './dto/find-all-peoples.dto';
import { UpdatePeopleDto } from './dto/update-people.dto';
import { People } from './model/people.model';
import { PeoplesService } from './peoples.service';

@ApiTags('peoples')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('peoples')
export class PeoplesController {
  constructor(private readonly peoplesService: PeoplesService) {}

  @Get()
  @RequirePermission(PERMISSIONS.CUSTOMERS.VIEW)
  @ApiOperation({ summary: 'List people with categories' })
  @ApiResponse({ type: PaginatedResponse(People) })
  findAll(@Query() query: FindAllPeoplesDto) {
    return this.peoplesService.findAll(query);
  }

  @Get('stats')
  @RequirePermission(PERMISSIONS.CUSTOMERS.VIEW)
  @ApiOperation({ summary: 'People statistics' })
  getStats() {
    return this.peoplesService.getStats();
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.CUSTOMERS.VIEW)
  @ApiOperation({ summary: 'Person details' })
  @ApiResponse({ type: People })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.peoplesService.findOne(id);
  }

  @Post()
  @RequirePermission(PERMISSIONS.CUSTOMERS.CREATE)
  @ApiOperation({ summary: 'Create person' })
  @ApiResponse({ type: People })
  create(@Body() dto: CreatePeopleDto) {
    return this.peoplesService.create(dto);
  }

  @Delete('bulk')
  @RequirePermission(PERMISSIONS.CUSTOMERS.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk delete people' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  bulkDelete(@Body() dto: BulkDeleteDto) {
    return this.peoplesService.bulkDelete(dto.ids);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.CUSTOMERS.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete person' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.peoplesService.delete(id);
  }

  @Patch(':id')
  @RequirePermission(PERMISSIONS.CUSTOMERS.UPDATE)
  @ApiOperation({ summary: 'Update person' })
  @ApiResponse({ type: People })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePeopleDto) {
    return this.peoplesService.update(id, dto);
  }

}
