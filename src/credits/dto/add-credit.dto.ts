import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddCreditDto {
  @ApiProperty({ example: 100.0 })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;
}
