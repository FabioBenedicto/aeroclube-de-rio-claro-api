"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const entity_schemas_1 = require("./entity-schemas");
function buildNested(path, value) {
    return [...path].reverse().reduce((acc, key) => ({ [key]: acc }), value);
}
function buildCondition(field, operator, rawValue) {
    const path = field.whereKey ?? (field.dbField ? [field.dbField] : null);
    if (!path)
        return null;
    if (operator === 'is_null')
        return buildNested(path, null);
    if (operator === 'is_not_null')
        return buildNested(path, { not: null });
    const value = field.coerce
        ? field.coerce(rawValue)
        : field.type === 'number'
            ? Number(rawValue)
            : field.type === 'date'
                ? new Date(rawValue)
                : rawValue;
    const cond = (() => {
        switch (operator) {
            case 'eq':
                return field.type === 'string'
                    ? { equals: value, mode: 'insensitive' }
                    : { equals: value };
            case 'neq':
                return { not: value };
            case 'contains':
                return { contains: value, mode: 'insensitive' };
            case 'gt':
                return { gt: value };
            case 'gte':
                return { gte: value };
            case 'lt':
                return { lt: value };
            case 'lte':
                return { lte: value };
            case 'in':
                return {
                    in: Array.isArray(rawValue)
                        ? rawValue.map(field.coerce ?? ((v) => v))
                        : [value],
                };
            default:
                return null;
        }
    })();
    return cond ? buildNested(path, cond) : null;
}
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    computeBaseInclude(entity, fields) {
        const entityInclude = entity_schemas_1.ENTITY_INCLUDE[entity] ?? {};
        const result = {};
        for (const field of fields) {
            if (!field.whereKey || field.whereKey.length <= 1)
                continue;
            const topKey = field.whereKey[0];
            if (topKey in entityInclude && !(topKey in result)) {
                result[topKey] = entityInclude[topKey];
            }
        }
        return result;
    }
    buildMergedSchema(dto) {
        const schema = entity_schemas_1.ENTITY_SCHEMAS[dto.entity];
        if (!schema)
            throw new common_1.BadRequestException(`Entidade desconhecida: ${dto.entity}`);
        const mergedSchema = [...schema];
        const mergedInclude = {};
        for (const joinKey of dto.joins ?? []) {
            const joinDef = entity_schemas_1.JOIN_DEFS[dto.entity]?.[joinKey];
            if (!joinDef)
                throw new common_1.BadRequestException(`Join desconhecido para ${dto.entity}: ${joinKey}`);
            Object.assign(mergedInclude, joinDef.include);
            const joinedSchema = entity_schemas_1.ENTITY_SCHEMAS[joinDef.entity] ?? [];
            for (const field of joinedSchema) {
                mergedSchema.push({
                    ...field,
                    key: `${joinKey}.${field.key}`,
                    label: `${joinDef.label}.${field.label}`,
                    whereKey: field.whereKey ? [joinKey, ...field.whereKey] : undefined,
                    dbField: undefined,
                    groupable: false,
                    aggregatable: false,
                    extract: (row) => field.extract(joinDef.extractRoot(row) ?? {}),
                });
            }
        }
        return {
            schema: mergedSchema,
            include: mergedInclude,
        };
    }
    async query(dto) {
        const { schema: mergedSchema, include: mergedInclude } = this.buildMergedSchema(dto);
        const AND = [];
        for (const filter of dto.filters ?? []) {
            const field = mergedSchema.find((s) => s.key === filter.field);
            if (!field)
                throw new common_1.BadRequestException(`Campo de filtro desconhecido: ${filter.field}`);
            const cond = buildCondition(field, filter.operator, filter.value);
            if (cond)
                AND.push(cond);
        }
        const where = AND.length > 0 ? { AND } : {};
        const limit = Math.min(dto.limit ?? 500, 1000);
        if (dto.groupBy?.length) {
            return this.runGrouped(dto.entity, mergedSchema, where, dto.groupBy, dto.aggregations ?? [], limit, mergedInclude);
        }
        const requestedFields = (dto.columns ?? []).map((key) => {
            const f = mergedSchema.find((s) => s.key === key);
            if (!f)
                throw new common_1.BadRequestException(`Campo desconhecido: ${key}`);
            return f;
        });
        return this.runFind(dto.entity, requestedFields, where, limit, mergedInclude);
    }
    async runFind(entity, fields, where, limit, include) {
        const finalInclude = {
            ...this.computeBaseInclude(entity, fields),
            ...(include ?? {}),
        };
        const rows = await this.prisma[entity_schemas_1.ENTITY_MODEL[entity]].findMany({
            where,
            include: finalInclude,
            take: limit,
            orderBy: { id: 'asc' },
        });
        return rows.map((row) => {
            const result = {};
            for (const f of fields)
                result[f.key] = f.extract(row);
            return result;
        });
    }
    extractPrismaMessage(err) {
        const meta = err?.meta?.message;
        if (meta)
            return meta.trim();
        const msg = err?.message ?? String(err);
        const match = msg.match(/Message:\s*`?([^`\n]+)`?/i);
        if (match)
            return match[1].trim();
        return (msg
            .split('\n')
            .map((l) => l.trim())
            .find((l) => l.length > 0) ?? msg);
    }
    serializeValue(val) {
        if (val instanceof Date)
            return val.toISOString();
        if (typeof val === 'bigint')
            return Number(val);
        if (val !== null && typeof val.toNumber === 'function')
            return val.toNumber();
        return val;
    }
    async rawQuery(dto) {
        const sql = dto.sql.trim();
        if (!/^select\b/i.test(sql)) {
            throw new common_1.BadRequestException('Apenas consultas SELECT são permitidas');
        }
        let rows;
        try {
            rows = await this.prisma.$queryRawUnsafe(sql);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Erro na consulta SQL: ${this.extractPrismaMessage(error)}`);
        }
        return rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, val]) => [
            key,
            this.serializeValue(val),
        ])));
    }
    async runGrouped(entity, schema, where, groupByKeys, aggregations, limit, _include) {
        const groupFields = groupByKeys.map((key) => {
            const f = schema.find((s) => s.key === key);
            if (!f)
                throw new common_1.BadRequestException(`Campo de agrupamento desconhecido: ${key}`);
            if (!f.groupable || !f.dbField)
                throw new common_1.BadRequestException(`O campo "${f?.label ?? key}" não suporta agrupamento`);
            return f;
        });
        const by = groupFields.map((f) => f.dbField);
        const _sum = {};
        const _avg = {};
        const _min = {};
        const _max = {};
        let hasCount = false;
        for (const agg of aggregations) {
            if (agg.fn === 'count') {
                hasCount = true;
            }
            else {
                const aggField = schema.find((s) => s.key === agg.field);
                if (!aggField?.aggregatable || !aggField.dbField) {
                    throw new common_1.BadRequestException(`O campo "${aggField?.label ?? agg.field}" não suporta agregação`);
                }
                if (agg.fn === 'sum')
                    _sum[aggField.dbField] = true;
                else if (agg.fn === 'avg')
                    _avg[aggField.dbField] = true;
                else if (agg.fn === 'min')
                    _min[aggField.dbField] = true;
                else if (agg.fn === 'max')
                    _max[aggField.dbField] = true;
            }
        }
        const groupResult = await this.prisma[entity_schemas_1.ENTITY_MODEL[entity]].groupBy({
            by,
            where,
            ...(Object.keys(_sum).length && { _sum }),
            ...(Object.keys(_avg).length && { _avg }),
            ...(Object.keys(_min).length && { _min }),
            ...(Object.keys(_max).length && { _max }),
            ...(hasCount && { _count: { id: true } }),
            orderBy: by.map((f) => ({ [f]: 'asc' })),
            take: limit,
        });
        return groupResult.map((row) => {
            const result = {};
            for (const f of groupFields) {
                let val = row[f.dbField];
                if (val instanceof Date)
                    val = val.toISOString().split('T')[0];
                else if (val?.toNumber)
                    val = val.toNumber();
                result[f.key] =
                    val !== null && val !== undefined
                        ? f.extract({ [f.dbField]: val })
                        : null;
            }
            for (const agg of aggregations) {
                if (agg.fn === 'count') {
                    result[agg.alias] = row._count?.id ?? 0;
                }
                else {
                    const aggField = schema.find((s) => s.key === agg.field);
                    const raw = row[`_${agg.fn}`]?.[aggField.dbField];
                    result[agg.alias] = raw != null ? Number(raw) : null;
                }
            }
            return result;
        });
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map