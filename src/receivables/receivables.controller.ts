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
  HttpCode,
  HttpStatus,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PERM } from '../common/constants/permissions';
import { ReceivablesService } from './receivables.service';
import { CreateReceivableDto } from './dto/create-receivable.dto';
import { UpdateReceivableDto } from './dto/update-receivable.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { buildExcel, reportFilename } from '../common/utils/excel.util';
import { notaFiscalStorage, notaFiscalFilter, buildNfPath, deleteNfFile } from '../common/utils/upload.config';
import { ExportThrottle } from '../common/decorators/export-throttle.decorator';
import { MAX_EXPORT_ROWS } from '../common/constants/export.constants';

const STATUS_LABEL: Record<number, string> = { 0: 'Open', 1: 'Paid' };

@ApiTags('receivables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('receivables')
export class ReceivablesController {
  constructor(private readonly receivablesService: ReceivablesService) {}

  @Get('export')
  @RequirePermission(PERM.RECEIVABLES.VIEW)
  @ExportThrottle()
  @ApiOperation({ summary: 'Export receivables to Excel' })
  async export(
    @Query('status') status: string,
    @Query('search') search: string,
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
    @Res() res: Response,
  ) {
    const { total } = await this.receivablesService.findAll(status, search, dateFrom, dateTo, 1, 1);
    if (total > MAX_EXPORT_ROWS) {
      throw new BadRequestException(
        `There are ${total} records. Use filters to reduce to at most ${MAX_EXPORT_ROWS}.`,
      );
    }
    const { data } = await this.receivablesService.findAll(status, search, dateFrom, dateTo, 1, total || 1);
    const rows = data.map((r: any) => ({
      id: r.id,
      title: r.title,
      product: r.product ?? '',
      customer: r.customer?.name ?? r.company?.name ?? '',
      expiration_date: r.expiration_date ? new Date(r.expiration_date).toLocaleDateString('pt-BR') : '',
      total_amount: Number(r.total_amount),
      amount_received: Number(r.amount_received),
      remaining: Number(r.total_amount) - Number(r.amount_received),
      status: STATUS_LABEL[r.status] ?? String(r.status),
    }));

    const buffer = await buildExcel('Receivables', [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Title', key: 'title', width: 35 },
      { header: 'Type', key: 'product', width: 16 },
      { header: 'Customer / Company', key: 'customer', width: 30 },
      { header: 'Due Date', key: 'expiration_date', width: 14 },
      { header: 'Total Amount (R$)', key: 'total_amount', width: 18 },
      { header: 'Received (R$)', key: 'amount_received', width: 16 },
      { header: 'Balance (R$)', key: 'remaining', width: 14 },
      { header: 'Status', key: 'status', width: 14 },
    ], rows);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${reportFilename('receivables.xlsx')}"`,
    });
    res.send(buffer);
  }

  @Get()
  @RequirePermission(PERM.RECEIVABLES.VIEW)
  @ApiOperation({ summary: 'List receivables' })
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.receivablesService.findAll(status, search, dateFrom, dateTo, Number(page), Number(limit));
  }

  @Get(':id')
  @RequirePermission(PERM.RECEIVABLES.VIEW)
  @ApiOperation({ summary: 'Get receivable details' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.receivablesService.findOne(id);
  }

  @Post()
  @RequirePermission(PERM.RECEIVABLES.CREATE)
  @ApiOperation({ summary: 'Create receivable' })
  create(@Body() dto: CreateReceivableDto) {
    return this.receivablesService.create(dto);
  }

  @Patch(':id')
  @RequirePermission(PERM.RECEIVABLES.UPDATE)
  @ApiOperation({ summary: 'Update receivable' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReceivableDto,
  ) {
    return this.receivablesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission(PERM.RECEIVABLES.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete receivable' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.receivablesService.delete(id);
  }

  @Post(':id/payments')
  @RequirePermission(PERM.RECEIVABLES.UPDATE)
  @ApiOperation({ summary: 'Register receivable payment' })
  registerPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.receivablesService.registerPayment(id, dto);
  }

  @Delete(':id/payments/:paymentId')
  @RequirePermission(PERM.RECEIVABLES.UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reverse receivable payment' })
  deletePayment(
    @Param('id', ParseIntPipe) _id: number,
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ) {
    return this.receivablesService.deletePayment(paymentId);
  }

  @Post(':id/payments/:paymentId/nota-fiscal')
  @RequirePermission(PERM.RECEIVABLES.UPDATE)
  @ApiOperation({ summary: 'Attach invoice (nota fiscal) to payment' })
  @UseInterceptors(FileInterceptor('file', {
    storage: notaFiscalStorage('receivable-payments'),
    fileFilter: notaFiscalFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadPaymentNotaFiscal(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const payment = await this.receivablesService.getPayment(paymentId);
    deleteNfFile(payment.nota_fiscal_path ?? null);
    const path = buildNfPath('receivable-payments', file.filename);
    return this.receivablesService.setPaymentNotaFiscal(paymentId, path);
  }

  @Delete(':id/payments/:paymentId/nota-fiscal')
  @RequirePermission(PERM.RECEIVABLES.UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove invoice (nota fiscal) from payment' })
  async deletePaymentNotaFiscal(@Param('paymentId', ParseIntPipe) paymentId: number) {
    const payment = await this.receivablesService.getPayment(paymentId);
    deleteNfFile(payment.nota_fiscal_path ?? null);
    await this.receivablesService.setPaymentNotaFiscal(paymentId, null);
  }
}
