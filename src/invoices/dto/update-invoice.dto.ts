import { IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ example: 'paid', enum: ['open', 'paid', 'cancelled'] })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: '2024-02-01' })
  @IsDateString()
  @IsOptional()
  due_date?: string;
}
