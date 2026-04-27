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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PayablesService } from './payables.service';
import { CreatePayableDto } from './dto/create-payable.dto';
import { UpdatePayableDto } from './dto/update-payable.dto';
import { CreatePayablePaymentDto } from './dto/create-payable-payment.dto';

@ApiTags('payables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payables')
export class PayablesController {
  constructor(private readonly payablesService: PayablesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar títulos a pagar' })
  findAll(@Query('status') status?: string) {
    return this.payablesService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do título a pagar' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.payablesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar título a pagar com parcelas' })
  create(@Body() dto: CreatePayableDto) {
    return this.payablesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar título a pagar' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePayableDto) {
    return this.payablesService.update(id, dto);
  }

  @Patch(':id/payments')
  @ApiOperation({ summary: 'Registrar pagamento de parcela' })
  registerPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePayablePaymentDto,
  ) {
    return this.payablesService.registerPayment(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir título a pagar' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.payablesService.remove(id);
  }
}
