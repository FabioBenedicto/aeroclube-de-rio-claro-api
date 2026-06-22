import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateReceivableTypeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
