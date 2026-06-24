import { UpsertSicoobSettingsDto } from '../../dto/upsert-sicoob-settings.dto';
import { SicoobSettings } from '../../model/sicoob-settings.model';

export const SICOOB_SETTINGS_REPOSITORY = Symbol('ISicoobSettingsRepository');

export interface ISicoobSettingsRepository {
  find(): Promise<SicoobSettings | null>;
  upsert(dto: UpsertSicoobSettingsDto): Promise<SicoobSettings>;
  incrementRemittanceSequence(): Promise<SicoobSettings>;
}
