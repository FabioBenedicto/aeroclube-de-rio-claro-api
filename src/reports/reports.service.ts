import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryReportDto, AggregationDto, RawQueryDto } from './dto/query-report.dto';
import { ENTITY_SCHEMAS, ENTITY_INCLUDE, ENTITY_MODEL, JOIN_DEFS, FieldDef } from './entity-schemas';

function buildNested(path: string[], value: any): Record<string, any> {
  return [...path].reverse().reduce((acc, key) => ({ [key]: acc }), value as any);
}

function buildCondition(field: FieldDef, operator: string, rawValue: any): Record<string, any> | null {
  const path = field.whereKey ?? (field.dbField ? [field.dbField] : null);
  if (!path) return null;

  if (operator === 'is_null') return buildNested(path, null);
  if (operator === 'is_not_null') return buildNested(path, { not: null });

  const value = field.coerce ? field.coerce(rawValue) : (
    field.type === 'number' ? Number(rawValue) :
    field.type === 'date' ? new Date(rawValue as string) :
    rawValue
  );

  const cond: any = (() => {
    switch (operator) {
      case 'eq':       return field.type === 'string' ? { equals: value, mode: 'insensitive' } : { equals: value };
      case 'neq':      return { not: value };
      case 'contains': return { contains: value, mode: 'insensitive' };
      case 'gt':       return { gt: value };
      case 'gte':      return { gte: value };
      case 'lt':       return { lt: value };
      case 'lte':      return { lte: value };
      case 'in':       return { in: Array.isArray(rawValue) ? rawValue.map(field.coerce ?? (v => v)) : [value] };
      default:         return null;
    }
  })();

  return cond ? buildNested(path, cond) : null;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  buildMergedSchema(dto: QueryReportDto): { schema: FieldDef[]; include: any } {
    const schema = ENTITY_SCHEMAS[dto.entity];
    if (!schema) throw new BadRequestException(`Entidade desconhecida: ${dto.entity}`);

    const mergedSchema: FieldDef[] = [...schema];
    const mergedInclude: any = { ...(ENTITY_INCLUDE[dto.entity] ?? {}) };

    for (const joinKey of dto.joins ?? []) {
      const joinDef = JOIN_DEFS[dto.entity]?.[joinKey];
      if (!joinDef) throw new BadRequestException(`Join desconhecido para ${dto.entity}: ${joinKey}`);

      Object.assign(mergedInclude, joinDef.include);

      const joinedSchema = ENTITY_SCHEMAS[joinDef.entity] ?? [];
      for (const field of joinedSchema) {
        mergedSchema.push({
          ...field,
          key: `${joinKey}.${field.key}`,
          label: `${joinDef.label}.${field.label}`,
          whereKey: field.whereKey ? [joinKey, ...field.whereKey] : undefined,
          dbField: undefined,
          groupable: false,
          aggregatable: false,
          extract: (row: any) => field.extract(joinDef.extractRoot(row) ?? {}),
        });
      }
    }

    return { schema: mergedSchema, include: mergedInclude };
  }

  async query(dto: QueryReportDto): Promise<Record<string, any>[]> {
    const { schema: mergedSchema, include: mergedInclude } = this.buildMergedSchema(dto);

    const AND: any[] = [];
    for (const filter of dto.filters ?? []) {
      const field = mergedSchema.find(s => s.key === filter.field);
      if (!field) throw new BadRequestException(`Campo de filtro desconhecido: ${filter.field}`);
      const cond = buildCondition(field, filter.operator, filter.value);
      if (cond) AND.push(cond);
    }
    const where = AND.length > 0 ? { AND } : {};
    const limit = Math.min(dto.limit ?? 500, 1000);

    if (dto.groupBy?.length) {
      return this.runGrouped(dto.entity, mergedSchema, where, dto.groupBy, dto.aggregations ?? [], limit, mergedInclude);
    }

    const requestedFields = dto.columns.map(key => {
      const f = mergedSchema.find(s => s.key === key);
      if (!f) throw new BadRequestException(`Campo desconhecido: ${key}`);
      return f;
    });

    return this.runFind(dto.entity, requestedFields, where, limit, mergedInclude);
  }

  private async runFind(entity: string, fields: FieldDef[], where: any, limit: number, include?: any) {
    const rows = await (this.prisma as any)[ENTITY_MODEL[entity]].findMany({
      where,
      include: include ?? ENTITY_INCLUDE[entity] ?? {},
      take: limit,
      orderBy: { id: 'asc' },
    });
    return rows.map((row: any) => {
      const result: Record<string, any> = {};
      for (const f of fields) result[f.key] = f.extract(row);
      return result;
    });
  }

  async rawQuery(dto: RawQueryDto): Promise<Record<string, any>[]> {
    const sql = dto.sql.trim();
    if (!/^select\b/i.test(sql)) {
      throw new BadRequestException('Only SELECT queries are allowed');
    }
    let rows: any[];
    try {
      rows = await this.prisma.$queryRawUnsafe(sql);
    } catch (err: any) {
      const meta: string | undefined = err?.meta?.message;
      if (meta) throw new BadRequestException(`Erro na consulta SQL: ${meta.trim()}`);
      const msg: string = err?.message ?? String(err);
      const match = msg.match(/Message:\s*`?([^`\n]+)`?/i);
      if (match) throw new BadRequestException(`Erro na consulta SQL: ${match[1].trim()}`);
      const firstLine = msg.split('\n').map(l => l.trim()).find(l => l.length > 0) ?? msg;
      throw new BadRequestException(`Erro na consulta SQL: ${firstLine}`);
    }
    return rows.map((row: any) => {
      const result: Record<string, any> = {};
      for (const key of Object.keys(row)) {
        const val = row[key];
        if (val instanceof Date) result[key] = val.toISOString();
        else if (typeof val === 'bigint') result[key] = Number(val);
        else if (val?.toNumber) result[key] = val.toNumber();
        else result[key] = val;
      }
      return result;
    });
  }

  private async runGrouped(
    entity: string,
    schema: FieldDef[],
    where: any,
    groupByKeys: string[],
    aggregations: AggregationDto[],
    limit: number,
    _include?: any,
  ) {
    const groupFields = groupByKeys.map(key => {
      const f = schema.find(s => s.key === key);
      if (!f) throw new BadRequestException(`Campo de agrupamento desconhecido: ${key}`);
      if (!f.groupable || !f.dbField) throw new BadRequestException(`Field "${f?.label ?? key}" does not support grouping`);
      return f;
    });

    const by = groupFields.map(f => f.dbField!) as any;
    const _sum: Record<string, boolean> = {};
    const _avg: Record<string, boolean> = {};
    const _min: Record<string, boolean> = {};
    const _max: Record<string, boolean> = {};
    let hasCount = false;

    for (const agg of aggregations) {
      if (agg.fn === 'count') {
        hasCount = true;
      } else {
        const aggField = schema.find(s => s.key === agg.field);
        if (!aggField?.aggregatable || !aggField.dbField) {
          throw new BadRequestException(`Field "${aggField?.label ?? agg.field}" does not support aggregation`);
        }
        if (agg.fn === 'sum') _sum[aggField.dbField] = true;
        else if (agg.fn === 'avg') _avg[aggField.dbField] = true;
        else if (agg.fn === 'min') _min[aggField.dbField] = true;
        else if (agg.fn === 'max') _max[aggField.dbField] = true;
      }
    }

    const groupResult: any[] = await (this.prisma as any)[ENTITY_MODEL[entity]].groupBy({
      by,
      where,
      ...(Object.keys(_sum).length && { _sum }),
      ...(Object.keys(_avg).length && { _avg }),
      ...(Object.keys(_min).length && { _min }),
      ...(Object.keys(_max).length && { _max }),
      ...(hasCount && { _count: { id: true } }),
      orderBy: by.map((f: string) => ({ [f]: 'asc' as const })),
      take: limit,
    });

    return groupResult.map((row: any) => {
      const result: Record<string, any> = {};
      for (const f of groupFields) {
        let val = row[f.dbField!];
        if (val instanceof Date) val = val.toISOString().split('T')[0];
        else if (val?.toNumber) val = val.toNumber();
        result[f.key] = val !== null && val !== undefined ? f.extract({ [f.dbField!]: val }) : null;
      }
      for (const agg of aggregations) {
        if (agg.fn === 'count') {
          result[agg.alias] = row._count?.id ?? 0;
        } else {
          const aggField = schema.find(s => s.key === agg.field)!;
          const raw = row[`_${agg.fn}`]?.[aggField.dbField!];
          result[agg.alias] = raw != null ? Number(raw) : null;
        }
      }
      return result;
    });
  }
}
