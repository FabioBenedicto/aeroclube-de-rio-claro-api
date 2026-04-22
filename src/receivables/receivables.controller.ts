import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ReceivablesService } from './receivables.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('receivables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('receivables')
export class ReceivablesController {
  constructor(private readonly receivablesService: ReceivablesService) {}

  @Post(':id/payments')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Registrar pagamento de título a receber' })
  @ApiResponse({ status: 201, description: 'Pagamento registrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Título não encontrado' })
  @ApiResponse({ status: 400, description: 'Título já quitado' })
  registerPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.receivablesService.registerPayment(id, dto);
  }
}
