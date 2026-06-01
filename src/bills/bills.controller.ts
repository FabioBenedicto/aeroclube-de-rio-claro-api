import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { CreateBoletoBillDto } from './dto/create-boleto-bill.dto';
import { notaFiscalStorage, notaFiscalFilter, buildNfPath, deleteNfFile } from '../common/utils/upload.config';

@ApiTags('bills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar faturas' })
  findAll(
    @Query('customer_id') customerId?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.billsService.findAll(
      customerId ? Number(customerId) : undefined,
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da fatura' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar pagamento agrupado' })
  create(@Body() dto: CreateBillDto) {
    return this.billsService.create(dto);
  }

  @Post('boleto')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar fatura de boleto (sem baixa imediata)' })
  createBoleto(@Body() dto: CreateBoletoBillDto) {
    return this.billsService.createBoleto(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar fatura' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBillDto) {
    return this.billsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Estornar e deletar fatura' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.billsService.delete(id);
  }

  @Post(':id/nota-fiscal')
  @ApiOperation({ summary: 'Anexar nota fiscal à fatura' })
  @UseInterceptors(FileInterceptor('file', {
    storage: notaFiscalStorage('bills'),
    fileFilter: notaFiscalFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadNotaFiscal(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');
    const bill = await this.billsService.findOne(id);
    deleteNfFile(bill.nota_fiscal_path ?? null);
    const path = buildNfPath('bills', file.filename);
    return this.billsService.setNotaFiscal(id, path);
  }

  @Delete(':id/nota-fiscal')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover nota fiscal da fatura' })
  async deleteNotaFiscal(@Param('id', ParseIntPipe) id: number) {
    const bill = await this.billsService.findOne(id);
    deleteNfFile(bill.nota_fiscal_path ?? null);
    await this.billsService.setNotaFiscal(id, null);
  }
}
