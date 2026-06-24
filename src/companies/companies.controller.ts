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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { FindAllCompaniesDto } from './dto/find-all-companies.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './model/company.model';

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @RequirePermission(PERMISSIONS.COMPANIES.VIEW)
  @ApiOperation({ summary: 'List companies' })
  @ApiResponse({ type: PaginatedResponse(Company) })
  findAll(@Query() query: FindAllCompaniesDto) {
    return this.companiesService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.COMPANIES.VIEW)
  @ApiOperation({ summary: 'Get company' })
  @ApiResponse({ type: Company })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.findOne(id);
  }

  @Post()
  @RequirePermission(PERMISSIONS.COMPANIES.CREATE)
  @ApiOperation({ summary: 'Create company' })
  @ApiResponse({ type: Company })
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Patch(':id')
  @RequirePermission(PERMISSIONS.COMPANIES.UPDATE)
  @ApiOperation({ summary: 'Update company' })
  @ApiResponse({ type: Company })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }

  @Delete('bulk')
  @RequirePermission(PERMISSIONS.COMPANIES.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk delete companies' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  bulkDelete(@Body() dto: BulkDeleteDto) {
    return this.companiesService.bulkDelete(dto.ids);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.COMPANIES.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete company' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.delete(id);
  }
}
