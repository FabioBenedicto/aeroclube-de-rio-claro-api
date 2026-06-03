import { IsString, IsArray, IsOptional, IsIn, IsNumber, ValidateNested, Min, Max, IsNotEmpty, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterDto {
  @IsString() @IsNotEmpty()
  field: string;

  @IsString()
  @IsIn(['eq', 'neq', 'contains', 'gt', 'gte', 'lt', 'lte', 'in', 'is_null', 'is_not_null'])
  operator: string;

  @IsOptional()
  value?: any;
}

export class AggregationDto {
  @IsString() @IsNotEmpty()
  field: string;

  @IsString()
  @IsIn(['sum', 'count', 'avg', 'min', 'max'])
  fn: string;

  @IsString() @IsNotEmpty()
  alias: string;
}

export class QueryReportDto {
  @IsString()
  @IsIn(['receivable', 'payable', 'flight', 'customer', 'bill', 'receivablePayment', 'payablePayment', 'company', 'partner', 'instructor', 'plane'])
  entity: string;

  @IsArray()
  @IsString({ each: true })
  columns: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  filters: FilterDto[];

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
