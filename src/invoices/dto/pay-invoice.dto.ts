import { IsString, IsDateString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PayInvoiceDto {
  @ApiProperty({ example: 'PIX', description: 'Meio de pagamento: PIX, dinheiro, transferência, etc.' })
  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @ApiPropertyOptional({ example: '2026-06-01', description: 'Data do pagamento (padrão: hoje)' })
  @IsDateString()
  @IsOptional()
  paid_at?: string;
}
