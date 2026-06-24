import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateReceivableTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
