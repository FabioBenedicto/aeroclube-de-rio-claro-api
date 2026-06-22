import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePayableTypeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
