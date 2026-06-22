import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePayableTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
