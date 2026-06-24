import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class GenerateRemessaDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  bill_ids: number[];
}
