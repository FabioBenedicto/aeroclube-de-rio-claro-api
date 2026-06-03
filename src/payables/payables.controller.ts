import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
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
import { PayablesService } from './payables.service';
import { CreatePayableDto } from './dto/create-payable.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';
import { CreatePayablePaymentDto } from './dto/create-payable-payment.dto';
import { buildExcel, reportFilename } from '../common/utils/excel.util';
import { notaFiscalStorage, notaFiscalFilter, buildNfPath, deleteNfFile } from '../common/utils/upload.config';
import { ExportThrottle } from '../common/decorators/export-throttle.decorator';
import { MAX_EXPORT_ROWS } from '../common/constants/export.constants';

const P_STATUS_LABEL: Record<string, string> = { open: 'Payable', partial: 'Partial', closed: 'Paid' };

@ApiTags('payables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('payables')
export class PayablesController {
  constructor(private readonly payablesService: PayablesService) {}

  @Get('export')
  @RequirePermission(PERM.PAYABLES.VIEW)
  @ExportThrottle()
  @ApiOperation({ summary: 'Export payables to Excel' })
  async export(
    @Query('status') status: string,
    @Query('search') search: string,
    @Query('date_from') dateFrom: string,
    @Query('date_to') dateTo: string,
    @Res() res: Response,
  ) {
    const { total } = await this.payablesService.findAll(status, undefined, search, dateFrom, dateTo, 1, 1);
    if (total > MAX_EXPORT_ROWS) {
      throw new BadRequestException(
        `There are ${total} records. Use filters to reduce to at most ${MAX_EXPORT_ROWS}.`,
      );
    }
    const { data } = await this.payablesService.findAll(status, undefined, search, dateFrom, dateTo, 1, total || 1);
    const rows = data.map((p: any) => ({
      id: p.id,
      title: p.title,
      product: p.product ?? '',
      due_date: p.due_date ? new Date(p.due_date).toLocaleDateString('pt-BR') : '',
      amount: Number(p.amount),
      amount_paid: Number(p.amount_paid),
      remaining: Number(p.amount) - Number(p.amount_paid),
      status: P_STATUS_LABEL[p.status] ?? p.status,
    }));

    const buffer = await buildExcel('Payables', [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Title', key: 'title', width: 35 },
      { header: 'Type', key: 'product', width: 16 },
      { header: 'Due Date', key: 'due_date', width: 14 },
      { header: 'Amount (R$)', key: 'amount', width: 16 },
      { header: 'Paid (R$)', key: 'amount_paid', width: 14 },
      { header: 'Balance (R$)', key: 'remaining', width: 14 },
      { header: 'Status', key: 'status', width: 14 },
    ], rows);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${reportFilename('payables.xlsx')}"`,
    });
    res.send(buffer);
  }

  @Get()
  @RequirePermission(PERM.PAYABLES.VIEW)
  @ApiOperation({ summary: 'List payables' })
  findAll(
    @Query('status') status?: string,
    @Query('client_id') clientId?: string,
    @Query('instructor_id') instructorId?: string,
    @Query('employee_id') employeeId?: string,
    @Query('search') search?: string,
    @Query('date_from') dateFrom?: string,
    @Query('date_to') dateTo?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.payablesService.findAll(status, clientId ? Number(clientId) : undefined, search, dateFrom, dateTo, Number(page), Number(limit), instructorId ? Number(instructorId) : undefined, employeeId ? Number(employeeId) : undefined);
  }

  @Get(':id')
  @RequirePermission(PERM.PAYABLES.VIEW)
  @ApiOperation({ summary: 'Get payable details' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.payablesService.findOne(id);
  }

  @Post()
  @RequirePermission(PERM.PAYABLES.CREATE)
  @ApiOperation({ summary: 'Create payable with installments' })
  create(@Body() dto: CreatePayableDto) {
    return this.payablesService.create(dto);
  }

  @Patch(':id')
  @RequirePermission(PERM.PAYABLES.UPDATE)
  @ApiOperation({ summary: 'Update payable' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePayableDto) {
    return this.payablesService.update(id, dto);
  }

  @Patch(':id/payments')
  @RequirePermission(PERM.PAYABLES.UPDATE)
  @ApiOperation({ summary: 'Register installment payment' })
  registerPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePayablePaymentDto,
  ) {
    return this.payablesService.registerPayment(id, dto);
  }

  @Delete(':id')
  @RequirePermission(PERM.PAYABLES.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete payable' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.payablesService.remove(id);
  }

  @Delete(':id/payments/:paymentId')
  @RequirePermission(PERM.PAYABLES.UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reverse payable payment' })
  deletePayment(
    @Param('id', ParseIntPipe) _id: number,
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ) {
    return this.payablesService.deletePayment(paymentId);
  }

  @Post(':id/payments/:paymentId/nota-fiscal')
  @RequirePermission(PERM.PAYABLES.UPDATE)
  @ApiOperation({ summary: 'Attach invoice (nota fiscal) to payment' })
  @UseInterceptors(FileInterceptor('file', {
    storage: notaFiscalStorage('payable-payments'),
    fileFilter: notaFiscalFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadPaymentNotaFiscal(
    @Param('paymentId', ParseIntPipe) paymentId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const payment = await this.payablesService.getPayment(paymentId);
    deleteNfFile(payment.nota_fiscal_path ?? null);
    const path = buildNfPath('payable-payments', file.filename);
    return this.payablesService.setPaymentNotaFiscal(paymentId, path);
  }

  @Delete(':id/payments/:paymentId/nota-fiscal')
  @RequirePermission(PERM.PAYABLES.UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove invoice (nota fiscal) from payment' })
  async deletePaymentNotaFiscal(@Param('paymentId', ParseIntPipe) paymentId: number) {
    const payment = await this.payablesService.getPayment(paymentId);
    deleteNfFile(payment.nota_fiscal_path ?? null);
    await this.payablesService.setPaymentNotaFiscal(paymentId, null);
  }
}
