import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PERM } from '../common/constants/permissions';
import { BillStatus } from '@prisma/client';
import { InvoicesService } from './invoices.service';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PayInvoiceDto } from './dto/pay-invoice.dto';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @RequirePermission(PERM.INVOICES.VIEW)
  @ApiOperation({ summary: 'Listar faturas' })
  @ApiQuery({ name: 'status', required: false, enum: ['open', 'pending_cnab', 'paid', 'cancelled'] })
  findAll(@Query('status') status?: BillStatus) {
    return this.invoicesService.listInvoices(status);
  }

  @Get(':id')
  @RequirePermission(PERM.INVOICES.VIEW)
  @ApiOperation({ summary: 'Detalhe da fatura' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.getInvoice(id);
  }

  @Patch(':id')
  @RequirePermission(PERM.INVOICES.UPDATE)
  @ApiOperation({ summary: 'Atualizar fatura (data de vencimento ou cancelar)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.updateInvoice(id, dto);
  }

  @Post(':id/pay')
  @RequirePermission(PERM.INVOICES.UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registrar pagamento manual da fatura' })
  pay(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PayInvoiceDto,
  ) {
    return this.invoicesService.payInvoice(id, dto);
  }
}
