import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePayableTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
