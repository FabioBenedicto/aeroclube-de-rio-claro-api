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
exports.FindAllPayablesDto = void 0;
const openapi = require("@nestjs/swagger");
const title_status_enum_1 = require("../../common/enums/title-status.enum");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
class FindAllPayablesDto extends pagination_dto_1.PaginationDto {
    status;
    person_id;
    instructor_id;
    employee_id;
    search;
    date_from;
    date_to;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: false, enum: require("../../common/enums/title-status.enum").ETitleStatus }, person_id: { required: false, type: () => Number }, instructor_id: { required: false, type: () => Number }, employee_id: { required: false, type: () => Number }, search: { required: false, type: () => String }, date_from: { required: false, type: () => Date }, date_to: { required: false, type: () => Date } };
    }
}
exports.FindAllPayablesDto = FindAllPayablesDto;
__decorate([
    (0, class_validator_1.IsEnum)(title_status_enum_1.ETitleStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FindAllPayablesDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FindAllPayablesDto.prototype, "person_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FindAllPayablesDto.prototype, "instructor_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FindAllPayablesDto.prototype, "employee_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FindAllPayablesDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], FindAllPayablesDto.prototype, "date_from", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], FindAllPayablesDto.prototype, "date_to", void 0);
//# sourceMappingURL=find-all-payables.dto.js.map