import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';
import { UpsertSettingsDto } from './dto/upsert-settings.dto';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get settings' })
  get() {
    return this.settingsService.get();
  }

  @Put()
  @ApiOperation({ summary: 'Save settings' })
  upsert(@Body() dto: UpsertSettingsDto) {
    return this.settingsService.upsert(dto);
  }
}
