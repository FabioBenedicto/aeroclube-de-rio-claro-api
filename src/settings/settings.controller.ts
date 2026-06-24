import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { PERMISSIONS } from '../common/constants/permissions';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { UpsertSettingsDto } from './dto/upsert-settings.dto';
import { UpsertSicoobSettingsDto } from './dto/upsert-sicoob-settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @RequirePermission(PERMISSIONS.SETTINGS.VIEW)
  @ApiOperation({ summary: 'Get settings' })
  get() {
    return this.settingsService.getSettings();
  }

  @Put()
  @RequirePermission(PERMISSIONS.SETTINGS.UPDATE)
  @ApiOperation({ summary: 'Save settings' })
  upsert(@Body() dto: UpsertSettingsDto) {
    return this.settingsService.upsertSettings(dto);
  }

  @Get('sicoob')
  @RequirePermission(PERMISSIONS.SETTINGS.VIEW)
  @ApiOperation({ summary: 'Get Sicoob settings' })
  getSicoob() {
    return this.settingsService.getSicoobSettings();
  }

  @Put('sicoob')
  @RequirePermission(PERMISSIONS.SETTINGS.UPDATE)
  @ApiOperation({ summary: 'Save Sicoob settings' })
  upsertSicoob(@Body() dto: UpsertSicoobSettingsDto) {
    return this.settingsService.upsertSicoobSettings(dto);
  }
}
