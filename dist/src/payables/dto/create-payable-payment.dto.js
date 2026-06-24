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
exports.CreatePayablePaymentDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const payment_method_enum_1 = require("../../common/enums/payment-method.enum");
class CreatePayablePaymentDto {
    amount;
    method;
    payment_date;
    static _OPENAPI_METADATA_FACTORY() {
        return { amount: { required: true, type: () => Number, minimum: 0.01 }, method: { required: false, enum: require("../../common/enums/payment-method.enum").EPaymentMethod }, payment_date: { required: false, type: () => String } };
    }
}
exports.CreatePayablePaymentDto = CreatePayablePaymentDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreatePayablePaymentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(payment_method_enum_1.EPaymentMethod),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePayablePaymentDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePayablePaymentDto.prototype, "payment_date", void 0);
//# sourceMappingURL=create-payable-payment.dto.js.map