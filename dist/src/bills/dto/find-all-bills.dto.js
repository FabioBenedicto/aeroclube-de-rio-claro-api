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
exports.FindAllBillsDto = void 0;
const openapi = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const bill_status_enum_1 = require("../enums/bill-status.enum");
class FindAllBillsDto extends pagination_dto_1.PaginationDto {
    people_id;
    date_from;
    date_to;
    pending;
    due_from;
    due_to;
    status;
    static _OPENAPI_METADATA_FACTORY() {
        return { people_id: { required: false, type: () => Number }, date_from: { required: false, type: () => Date }, date_to: { required: false, type: () => Date }, pending: { required: false, type: () => Boolean }, due_from: { required: false, type: () => Date }, due_to: { required: false, type: () => Date }, status: { required: false, enum: require("../enums/bill-status.enum").EBillStatus } };
    }
}
exports.FindAllBillsDto = FindAllBillsDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], FindAllBillsDto.prototype, "people_id", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], FindAllBillsDto.prototype, "date_from", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], FindAllBillsDto.prototype, "date_to", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], FindAllBillsDto.prototype, "pending", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], FindAllBillsDto.prototype, "due_from", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], FindAllBillsDto.prototype, "due_to", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(bill_status_enum_1.EBillStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FindAllBillsDto.prototype, "status", void 0);
//# sourceMappingURL=find-all-bills.dto.js.map