import { IsOptional, IsString } from 'class-validator';

export class UpdateReceivableTypeDto {
  @IsString()
  @IsOptional()
  name?: string;
}
