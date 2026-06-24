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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PERMISSIONS } from '../common/constants/permissions';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { CreatePayableTypeDto } from './dto/create-payable-type.dto';
import { UpdatePayableTypeDto } from './dto/update-payable-type.dto';
import { PayableTypesService } from './payable-types.service';

@ApiTags('payable-types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('payable-types')
export class PayableTypesController {
  constructor(private readonly service: PayableTypesService) {}

  @Get()
  @RequirePermission(PERMISSIONS.TITLE_TYPES.VIEW)
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @RequirePermission(PERMISSIONS.TITLE_TYPES.CREATE)
  create(@Body() dto: CreatePayableTypeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermission(PERMISSIONS.TITLE_TYPES.UPDATE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePayableTypeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.TITLE_TYPES.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
