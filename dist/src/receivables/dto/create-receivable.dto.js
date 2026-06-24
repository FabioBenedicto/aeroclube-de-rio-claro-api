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
exports.CreateReceivableDto = void 0;
const openapi = require("@nestjs/swagger");
const recurrence_enum_1 = require("../../common/enums/recurrence.enum");
const stakeholder_enum_1 = require("../../common/enums/stakeholder.enum");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateReceivableDto {
    stakeholder;
    person_id;
    student_id;
    company_id;
    instructor_id;
    partner_id;
    employee_id;
    plane_id;
    flight_id;
    bill_id;
    title;
    description;
    total_amount;
    expiration_date;
    receivable_type_id;
    adds_credit;
    recurrence;
    occurrences;
    static _OPENAPI_METADATA_FACTORY() {
        return { stakeholder: { required: false, enum: require("../../common/enums/stakeholder.enum").EStakeholder }, person_id: { required: false, type: () => Number }, student_id: { required: false, type: () => Number }, company_id: { required: false, type: () => Number }, instructor_id: { required: false, type: () => Number }, partner_id: { required: false, type: () => Number }, employee_id: { required: false, type: () => Number }, plane_id: { required: false, type: () => Number }, flight_id: { required: false, type: () => Number }, bill_id: { required: false, type: () => Number }, title: { required: true, type: () => String }, description: { required: false, type: () => String }, total_amount: { required: true, type: () => Number, minimum: 0.01 }, expiration_date: { required: true, type: () => Date }, receivable_type_id: { required: false, type: () => Number }, adds_credit: { required: false, type: () => Boolean }, recurrence: { required: false, enum: require("../../common/enums/recurrence.enum").ERecurrence }, occurrences: { required: true, type: () => Number, minimum: 2 } };
    }
}
exports.CreateReceivableDto = CreateReceivableDto;
__decorate([
    (0, class_validator_1.IsEnum)(stakeholder_enum_1.EStakeholder),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateReceivableDto.prototype, "stakeholder", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateReceivableDto.prototype, "person_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateReceivableDto.prototype, "student_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateReceivableDto.prototype, "company_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateReceivableDto.prototype, "instructor_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateReceivableDto.prototype, "partner_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateReceivableDto.prototype, "employee_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateReceivableDto.prototype, "plane_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateReceivableDto.prototype, "flight_id", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateReceivableDto.prototype, "bill_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReceivableDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateReceivableDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreateReceivableDto.prototype, "total_amount", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateReceivableDto.prototype, "expiration_date", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateReceivableDto.prototype, "receivable_type_id", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateReceivableDto.prototype, "adds_credit", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(recurrence_enum_1.ERecurrence),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateReceivableDto.prototype, "recurrence", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2),
    (0, class_validator_1.ValidateIf)((o) => o.recurrence),
    __metadata("design:type", Number)
], CreateReceivableDto.prototype, "occurrences", void 0);
//# sourceMappingURL=create-receivable.dto.js.map