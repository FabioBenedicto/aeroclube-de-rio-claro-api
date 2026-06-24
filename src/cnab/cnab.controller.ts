import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ERoles } from '../users/enums/roles.enum';

import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaginatedResponse } from '../common/swagger/paginated-response';
import { CnabService } from './cnab.service';
import { GenerateRemessaDto } from './dto/generate-remessa.dto';
import { CnabRemittent } from './model/cnab-remittent.model';

@ApiTags('cnab')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cnab')
export class CnabController {
  constructor(private readonly cnabService: CnabService) {}

  @Get('remittent')
  @Roles(ERoles.ADMIN)
  @ApiOperation({ summary: 'List generated CNAB remessa files' })
  @ApiResponse({ type: PaginatedResponse(CnabRemittent) })
  listRemittent(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.cnabService.listRemittent(Number(page), Number(limit));
  }

  @Post('remittent')
  @Roles(ERoles.ADMIN)
  @ApiOperation({ summary: 'Generate CNAB 240 Remittent file for Sicoob' })
  @ApiResponse({ type: CnabRemittent })
  generateRemittent(@Body() dto: GenerateRemessaDto) {
    return this.cnabService.generateRemittent(dto);
  }

  @Get('remittent/:id')
  @Roles(ERoles.ADMIN)
  @ApiOperation({ summary: 'Get CNAB Remittent with associated bills' })
  getRemittentDetail(@Param('id', ParseIntPipe) id: number) {
    return this.cnabService.getRemittentDetail(id);
  }

  @Get('remittent/:id/download')
  @Roles(ERoles.ADMIN)
  @ApiOperation({ summary: 'Download Remittent file' })
  async downloadRemittent(@Param('id', ParseIntPipe) id: number) {
    const { buffer, filename } = await this.cnabService.downloadRemessa(id);

    return new StreamableFile(buffer, {
      type: 'application/octet-stream',
      disposition: `attachment; filename="${filename}"`,
      length: buffer.length,
    });
  }

  @Delete('remittent/:id')
  @Roles(ERoles.ADMIN)
  @ApiOperation({ summary: 'Delete CNAB Remittent and revert bills to open' })
  deleteRemittent(@Param('id', ParseIntPipe) id: number) {
    return this.cnabService.deleteRemittent(id);
  }
}
