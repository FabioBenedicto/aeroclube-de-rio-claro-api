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
exports.UpsertSicoobSettingsDto = void 0;
const openapi = require("@nestjs/swagger");
const is_cnpj_decorator_1 = require("../../common/decorators/is-cnpj.decorator");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class UpsertSicoobSettingsDto {
    cooperative_prefix;
    cooperative_digit;
    branch;
    account;
    account_digit;
    wallet;
    modality;
    cnpj;
    company_name;
    interest_rate;
    interest_period;
    interest_type;
    static _OPENAPI_METADATA_FACTORY() {
        return { cooperative_prefix: { required: false, type: () => String, pattern: "^\\d{5}$" }, cooperative_digit: { required: false, type: () => String, pattern: "^\\d{1}$" }, branch: { required: false, type: () => String, pattern: "^\\d{1,4}$" }, account: { required: false, type: () => String, pattern: "^\\d{1,12}$" }, account_digit: { required: false, type: () => String, pattern: "^\\d{1}$" }, wallet: { required: false, type: () => String, pattern: "^\\d{1}$" }, modality: { required: false, type: () => String, pattern: "^\\d{2}$" }, cnpj: { required: false, type: () => String }, company_name: { required: false, type: () => String }, interest_rate: { required: false, type: () => Number, minimum: 0, maximum: 100 }, interest_period: { required: false, type: () => Number, minimum: 0 }, interest_type: { required: false, type: () => String, pattern: "^[012]$" } };
    }
}
exports.UpsertSicoobSettingsDto = UpsertSicoobSettingsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{5}$/, { message: 'cooperative_prefix must have 5 digits' }),
    __metadata("design:type", String)
], UpsertSicoobSettingsDto.prototype, "cooperative_prefix", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{1}$/, { message: 'cooperative_digit must have 1 digit' }),
    __metadata("design:type", String)
], UpsertSicoobSettingsDto.prototype, "cooperative_digit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{1,4}$/, { message: 'branch must have up to 4 digits' }),
    __metadata("design:type", String)
], UpsertSicoobSettingsDto.prototype, "branch", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{1,12}$/, { message: 'account must have up to 12 digits' }),
    __metadata("design:type", String)
], UpsertSicoobSettingsDto.prototype, "account", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{1}$/, { message: 'account_digit must have 1 digit' }),
    __metadata("design:type", String)
], UpsertSicoobSettingsDto.prototype, "account_digit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{1}$/, { message: 'wallet must have 1 digit' }),
    __metadata("design:type", String)
], UpsertSicoobSettingsDto.prototype, "wallet", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^\d{2}$/, { message: 'modality must have 2 digits' }),
    __metadata("design:type", String)
], UpsertSicoobSettingsDto.prototype, "modality", void 0);
__decorate([
    (0, is_cnpj_decorator_1.IsCNPJ)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpsertSicoobSettingsDto.prototype, "cnpj", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpsertSicoobSettingsDto.prototype, "company_name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpsertSicoobSettingsDto.prototype, "interest_rate", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpsertSicoobSettingsDto.prototype, "interest_period", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(/^[012]$/, { message: 'interest_type must be 0, 1 or 2' }),
    __metadata("design:type", String)
], UpsertSicoobSettingsDto.prototype, "interest_type", void 0);
//# sourceMappingURL=upsert-sicoob-settings.dto.js.map