import {
  Controller, Get, Post, Param, Body, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreditsService } from './credits.service';
import { AddCreditDto } from './dto/add-credit.dto';

@ApiTags('credits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('peoples/:personId/credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get()
  @ApiOperation({ summary: 'Credit balance and movements for a person' })
  getCredits(@Param('personId', ParseIntPipe) personId: number) {
    return this.creditsService.getPersonCredits(personId);
  }

  @Post()
  @ApiOperation({ summary: 'Add credit to a person' })
  addCredit(
    @Param('personId', ParseIntPipe) personId: number,
    @Body() dto: AddCreditDto,
  ) {
    return this.creditsService.addCredit(personId, dto);
  }
}
