import { Controller, Get, Post, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PayablesService, CreatePayablePaymentDto } from './payables.service';

@ApiTags('payables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payables')
export class PayablesController {
  constructor(private readonly payablesService: PayablesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar títulos a pagar' })
  findAll(@Query('status') status?: string) { return this.payablesService.findAll(status); }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do título a pagar' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.payablesService.findOne(id); }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Registrar pagamento de parcela' })
  registerPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePayablePaymentDto,
  ) { return this.payablesService.registerPayment(id, dto); }
}
