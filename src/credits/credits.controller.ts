import { Controller, Get, Post, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreditsService, AddCreditDto } from './credits.service';

@ApiTags('credits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers/:customerId/credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get()
  @ApiOperation({ summary: 'Saldo e movimentações de crédito do cliente' })
  getCredits(@Param('customerId', ParseIntPipe) customerId: number) {
    return this.creditsService.getCustomerCredits(customerId);
  }

  @Post()
  @ApiOperation({ summary: 'Adicionar crédito ao cliente' })
  addCredit(@Param('customerId', ParseIntPipe) customerId: number, @Body() dto: AddCreditDto) {
    return this.creditsService.addCredit(customerId, dto);
  }
}
