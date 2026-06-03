import { IsString, IsDateString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PayInvoiceDto {
  @ApiProperty({ example: 'PIX', description: 'Payment method: PIX, cash, transfer, etc.' })
  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @ApiPropertyOptional({ example: '2026-06-01', description: 'Payment date (default: today)' })
  @IsDateString()
  @IsOptional()
  paid_at?: string;
}
