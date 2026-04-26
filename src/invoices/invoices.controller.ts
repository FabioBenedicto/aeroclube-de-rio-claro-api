import { Controller, Get, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { InvoicesService, UpdateInvoiceDto } from './invoices.service';

@ApiTags('invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar faturas' })
  findAll() { return this.invoicesService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da fatura' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.invoicesService.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar fatura' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, dto);
  }
}
