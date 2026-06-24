import { Type } from 'class-transformer';

export class Settings {
  id: number;

  @Type(() => Number)
  partner_monthly_dues: number;

  @Type(() => Number)
  instructor_percentage: number;

  glider_initial_minutes: number;

  @Type(() => Number)
  glider_initial_value: number;

  @Type(() => Number)
  glider_minute_value: number;
}
