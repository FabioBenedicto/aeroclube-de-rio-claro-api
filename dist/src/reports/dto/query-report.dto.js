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
exports.RawQueryDto = exports.QueryReportDto = exports.AggregationDto = exports.FilterDto = void 0;
const openapi = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class FilterDto {
    field;
    operator;
    value;
    static _OPENAPI_METADATA_FACTORY() {
        return { field: { required: true, type: () => String }, operator: { required: true, type: () => String, enum: [
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
                ] }, value: { required: false, type: () => Object } };
    }
}
exports.FilterDto = FilterDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FilterDto.prototype, "field", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)([
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
    ]),
    __metadata("design:type", String)
], FilterDto.prototype, "operator", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], FilterDto.prototype, "value", void 0);
class AggregationDto {
    field;
    fn;
    alias;
    static _OPENAPI_METADATA_FACTORY() {
        return { field: { required: true, type: () => String }, fn: { required: true, type: () => String, enum: ['sum', 'count', 'avg', 'min', 'max'] }, alias: { required: true, type: () => String } };
    }
}
exports.AggregationDto = AggregationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AggregationDto.prototype, "field", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['sum', 'count', 'avg', 'min', 'max']),
    __metadata("design:type", String)
], AggregationDto.prototype, "fn", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AggregationDto.prototype, "alias", void 0);
class QueryReportDto {
    entity;
    columns;
    filters;
    groupBy;
    aggregations;
    joins;
    limit;
    page;
    offset;
    static _OPENAPI_METADATA_FACTORY() {
        return { entity: { required: true, type: () => String, enum: [
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
                ] }, columns: { required: false, type: () => [String] }, filters: { required: false, type: () => [require("./query-report.dto").FilterDto] }, groupBy: { required: false, type: () => [String] }, aggregations: { required: false, type: () => [require("./query-report.dto").AggregationDto] }, joins: { required: false, type: () => [String] }, limit: { required: false, type: () => Number, minimum: 1, maximum: 1000 }, page: { required: false, type: () => Number, minimum: 1 }, offset: { required: false, type: () => Number, minimum: 0 } };
    }
}
exports.QueryReportDto = QueryReportDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)([
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
    ]),
    __metadata("design:type", String)
], QueryReportDto.prototype, "entity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], QueryReportDto.prototype, "columns", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FilterDto),
    __metadata("design:type", Array)
], QueryReportDto.prototype, "filters", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], QueryReportDto.prototype, "groupBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AggregationDto),
    __metadata("design:type", Array)
], QueryReportDto.prototype, "aggregations", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], QueryReportDto.prototype, "joins", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], QueryReportDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryReportDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], QueryReportDto.prototype, "offset", void 0);
class RawQueryDto {
    sql;
    static _OPENAPI_METADATA_FACTORY() {
        return { sql: { required: true, type: () => String, maxLength: 4000 } };
    }
}
exports.RawQueryDto = RawQueryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(4000),
    __metadata("design:type", String)
], RawQueryDto.prototype, "sql", void 0);
//# sourceMappingURL=query-report.dto.js.map