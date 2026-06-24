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
exports.UpdatePeopleDto = void 0;
const openapi = require("@nestjs/swagger");
const is_cpf_decorator_1 = require("../../common/decorators/is-cpf.decorator");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const employee_dto_1 = require("./employee.dto");
const instructor_dto_1 = require("./instructor.dto");
const partner_dto_1 = require("./partner.dto");
const student_dto_1 = require("./student.dto");
class UpdatePeopleDto {
    cpf;
    name;
    email;
    phone_number;
    instructor;
    student;
    partner;
    employee;
    street;
    neighborhood;
    city;
    state;
    zip_code;
    static _OPENAPI_METADATA_FACTORY() {
        return { cpf: { required: false, type: () => String }, name: { required: false, type: () => String }, email: { required: false, type: () => String, format: "email" }, phone_number: { required: false, type: () => String }, instructor: { required: false, type: () => require("./instructor.dto").InstructorDto }, student: { required: false, type: () => require("./student.dto").StudentDto }, partner: { required: false, type: () => require("./partner.dto").PartnerDto }, employee: { required: false, type: () => require("./employee.dto").EmployeeDto }, street: { required: false, type: () => String }, neighborhood: { required: false, type: () => String }, city: { required: false, type: () => String }, state: { required: false, type: () => String, pattern: "^[A-Z]{2}$" }, zip_code: { required: false, type: () => String, pattern: "^\\d{8}$" } };
    }
}
exports.UpdatePeopleDto = UpdatePeopleDto;
__decorate([
    (0, is_cpf_decorator_1.IsCPF)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePeopleDto.prototype, "cpf", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePeopleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePeopleDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePeopleDto.prototype, "phone_number", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => instructor_dto_1.InstructorDto),
    __metadata("design:type", instructor_dto_1.InstructorDto)
], UpdatePeopleDto.prototype, "instructor", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => student_dto_1.StudentDto),
    __metadata("design:type", student_dto_1.StudentDto)
], UpdatePeopleDto.prototype, "student", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => partner_dto_1.PartnerDto),
    __metadata("design:type", partner_dto_1.PartnerDto)
], UpdatePeopleDto.prototype, "partner", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => employee_dto_1.EmployeeDto),
    __metadata("design:type", employee_dto_1.EmployeeDto)
], UpdatePeopleDto.prototype, "employee", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePeopleDto.prototype, "street", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePeopleDto.prototype, "neighborhood", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePeopleDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^[A-Z]{2}$/, {
        message: 'state must be a 2-letter uppercase abbreviation',
    }),
    __metadata("design:type", String)
], UpdatePeopleDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{8}$/, { message: 'zip_code must be 8 digits without hyphen' }),
    __metadata("design:type", String)
], UpdatePeopleDto.prototype, "zip_code", void 0);
//# sourceMappingURL=update-people.dto.js.map