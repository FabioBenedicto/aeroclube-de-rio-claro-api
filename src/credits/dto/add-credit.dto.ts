import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddCreditDto {
  @ApiProperty({ example: 100.0 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({ example: 'Crédito por horas de instrução' })
  @IsString()
  @IsOptional()
  notes?: string;
}
