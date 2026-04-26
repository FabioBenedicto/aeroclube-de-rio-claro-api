import { IsString, IsEmail, IsNumber, IsOptional, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCustomerDto {
  @ApiProperty({ example: '412.908.557-03' })
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiProperty({ example: 'Helena Marques' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'helena@email.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '(19) 98112-4430' })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  flight_hour_balance?: number;
}
