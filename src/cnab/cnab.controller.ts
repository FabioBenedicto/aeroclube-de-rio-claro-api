import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CnabService } from './cnab.service';
import { GenerateRemessaDto } from './dto/generate-remessa.dto';

@ApiTags('cnab')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cnab')
export class CnabController {
  constructor(private readonly cnabService: CnabService) {}

  @Post('remessa')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Gerar arquivo CNAB 240 de remessa para o Sicoob' })
  generateRemessa(@Body() dto: GenerateRemessaDto) {
    return this.cnabService.generateRemessa(dto);
  }

  @Get('remessas')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar remessas CNAB geradas' })
  listRemessas(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.cnabService.listRemessas(Number(page), Number(limit));
  }

  @Get('remessas/:id/download')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Baixar arquivo .rem de uma remessa' })
  async downloadRemessa(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.cnabService.downloadRemessa(id);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Get('retornos')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar retornos CNAB processados' })
  listRetornos(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.cnabService.listRetornos(Number(page), Number(limit));
  }

  @Post('retorno')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Processar arquivo CNAB 240 de retorno do Sicoob' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async processRetorno(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Arquivo de retorno não enviado (campo: file)');
    return this.cnabService.processRetorno(file.buffer);
  }
}
