import { IsIn, IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ example: 'cancelled', enum: ['cancelled'] })
  @IsIn(['cancelled'])
  @IsOptional()
  status?: 'cancelled';

  @ApiPropertyOptional({ example: '2026-07-01' })
  @IsDateString()
  @IsOptional()
  due_date?: string;
}
