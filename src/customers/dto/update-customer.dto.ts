import { IsString, IsEmail, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'Helena Marques' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'helena@email.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '(19) 98112-4430' })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  flight_hour_balance?: number;
}
