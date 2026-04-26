import { IsInt, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePayablePaymentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  installment_id: number;

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount_paid: number;

  @ApiPropertyOptional({ example: '2024-01-15T14:00:00Z' })
  @IsDateString()
  @IsOptional()
  payment_date?: string;
}
