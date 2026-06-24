import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class FilterDto {
  @IsString()
  @IsNotEmpty()
  field: string;

  @IsString()
  @IsIn([
    'eq',
    'neq',
    'contains',
    'gt',
    'gte',
    'lt',
    'lte',
    'in',
    'is_null',
    'is_not_null',
  ])
  operator: string;

  @IsOptional()
  value?: any;
}

export class AggregationDto {
  @IsString()
  @IsNotEmpty()
  field: string;

  @IsString()
  @IsIn(['sum', 'count', 'avg', 'min', 'max'])
  fn: string;

  @IsString()
  @IsNotEmpty()
  alias: string;
}

export class QueryReportDto {
  @IsString()
  @IsIn([
    'receivable',
    'payable',
    'flight',
    'people',
    'bill',
    'receivablePayment',
    'payablePayment',
    'company',
    'partner',
    'instructor',
    'aircraft',
    'receivableType',
    'payableType',
    'address',
    'student',
    'employee',
    'cnabRemessa',
    'file',
  ])
  entity: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columns?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  filters?: FilterDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupBy?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AggregationDto)
  aggregations?: AggregationDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  joins?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;
}

export class RawQueryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  sql: string;
}
