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
exports.UpdateReceivableDto = void 0;
const openapi = require("@nestjs/swagger");
const stakeholder_enum_1 = require("../../common/enums/stakeholder.enum");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class UpdateReceivableDto {
    stakeholder;
    person_id;
    student_id;
    company_id;
    bill_id;
    plane_id;
    flight_id;
    instructor_id;
    partner_id;
    employee_id;
    title;
    description;
    total_amount;
    expiration_date;
    receivable_type_id;
    static _OPENAPI_METADATA_FACTORY() {
        return { stakeholder: { required: false, enum: require("../../common/enums/stakeholder.enum").EStakeholder }, person_id: { required: false, type: () => Number }, student_id: { required: false, type: () => Number }, company_id: { required: false, type: () => Number }, bill_id: { required: false, type: () => Number }, plane_id: { required: false, type: () => Number }, flight_id: { required: false, type: () => Number, nullable: true, minimum: 1 }, instructor_id: { required: false, type: () => Number }, partner_id: { required: false, type: () => Number }, employee_id: { required: false, type: () => Number }, title: { required: false, type: () => String }, description: { required: false, type: () => String }, total_amount: { required: false, type: () => Number, minimum: 0.01 }, expiration_date: { required: false, type: () => Date }, receivable_type_id: { required: false, type: () => Number } };
    }
}
exports.UpdateReceivableDto = UpdateReceivableDto;
__decorate([
    (0, class_validator_1.IsEnum)(stakeholder_enum_1.EStakeholder),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateReceivableDto.prototype, "stakeholder", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateReceivableDto.prototype, "person_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateReceivableDto.prototype, "student_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateReceivableDto.prototype, "company_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateReceivableDto.prototype, "bill_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateReceivableDto.prototype, "plane_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => o.flight_id !== null),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Object)
], UpdateReceivableDto.prototype, "flight_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateReceivableDto.prototype, "instructor_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateReceivableDto.prototype, "partner_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateReceivableDto.prototype, "employee_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateReceivableDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateReceivableDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateReceivableDto.prototype, "total_amount", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateReceivableDto.prototype, "expiration_date", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateReceivableDto.prototype, "receivable_type_id", void 0);
//# sourceMappingURL=update-receivable.dto.js.map