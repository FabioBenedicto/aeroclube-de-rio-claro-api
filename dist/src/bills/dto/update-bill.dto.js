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
exports.UpdateBillDto = exports.BillItemDto = void 0;
const openapi = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const class_validator_2 = require("class-validator");
class BillItemDto {
    receivable_id;
    amount;
    static _OPENAPI_METADATA_FACTORY() {
        return { receivable_id: { required: true, type: () => Number }, amount: { required: true, type: () => Number, minimum: 0.01 } };
    }
}
exports.BillItemDto = BillItemDto;
__decorate([
    (0, class_validator_2.IsInt)(),
    __metadata("design:type", Number)
], BillItemDto.prototype, "receivable_id", void 0);
__decorate([
    (0, class_validator_2.IsNumber)(),
    (0, class_validator_2.Min)(0.01),
    __metadata("design:type", Number)
], BillItemDto.prototype, "amount", void 0);
class UpdateBillDto {
    people_id;
    items;
    expiration_date;
    static _OPENAPI_METADATA_FACTORY() {
        return { people_id: { required: true, type: () => Number }, items: { required: false, type: () => [require("./update-bill.dto").BillItemDto], minItems: 1 }, expiration_date: { required: false, type: () => Date } };
    }
}
exports.UpdateBillDto = UpdateBillDto;
__decorate([
    (0, class_validator_2.IsInt)(),
    __metadata("design:type", Number)
], UpdateBillDto.prototype, "people_id", void 0);
__decorate([
    (0, class_validator_2.IsArray)(),
    (0, class_validator_2.ArrayNotEmpty)(),
    (0, class_validator_2.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BillItemDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateBillDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_2.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateBillDto.prototype, "expiration_date", void 0);
//# sourceMappingURL=update-bill.dto.js.map