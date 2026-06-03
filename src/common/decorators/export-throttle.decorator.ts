import { UseGuards, applyDecorators } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

/** Limits export endpoints to 3 requests per minute per IP. */
export const ExportThrottle = () =>
  applyDecorators(
    UseGuards(ThrottlerGuard),
    Throttle({ default: { limit: 3, ttl: 60_000 } }),
  );
