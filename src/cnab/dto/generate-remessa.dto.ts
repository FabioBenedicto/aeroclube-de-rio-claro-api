import { IsArray, IsInt, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateRemessaDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Type(() => Number)
  bill_ids: number[];
}
