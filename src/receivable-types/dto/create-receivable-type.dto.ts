import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReceivableTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
