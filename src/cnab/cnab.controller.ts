import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
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
  async generateRemessa(@Body() dto: GenerateRemessaDto, @Res() res: Response) {
    const buffer = await this.cnabService.generateRemessa(dto);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="remessa_${date}.rem"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
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
