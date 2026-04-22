import { IsNumber, IsString, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @ApiProperty({ example: 150.0 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount_received: number;

  @ApiPropertyOptional({ example: 'pix' })
  @IsString()
  @IsOptional()
  payment_method?: string;

  @ApiPropertyOptional({ example: '2024-01-15T14:00:00Z' })
  @IsDateString()
  @IsOptional()
  payment_date?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
