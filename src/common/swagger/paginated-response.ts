import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function PaginatedResponse<T>(classRef: Type<T>) {
  abstract class PaginatedResponseClass {
    @ApiProperty({ type: [classRef] })
    data: T[];

    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  return PaginatedResponseClass;
}
