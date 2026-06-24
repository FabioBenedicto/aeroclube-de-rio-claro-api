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
exports.PayBillDto = void 0;
const openapi = require("@nestjs/swagger");
const payment_method_enum_1 = require("../../common/enums/payment-method.enum");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class PayBillDto {
    payment_method;
    payment_date;
    use_credit;
    static _OPENAPI_METADATA_FACTORY() {
        return { payment_method: { required: true, type: () => String }, payment_date: { required: true, type: () => Date }, use_credit: { required: false, type: () => Boolean } };
    }
}
exports.PayBillDto = PayBillDto;
__decorate([
    (0, class_validator_1.IsEnum)(payment_method_enum_1.EPaymentMethod),
    __metadata("design:type", String)
], PayBillDto.prototype, "payment_method", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], PayBillDto.prototype, "payment_date", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true'),
    __metadata("design:type", Boolean)
], PayBillDto.prototype, "use_credit", void 0);
//# sourceMappingURL=pay-bill.dto.js.map