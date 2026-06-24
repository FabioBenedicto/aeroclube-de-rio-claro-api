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
exports.Company = void 0;
const class_transformer_1 = require("class-transformer");
const payable_model_1 = require("../../payables/model/payable.model");
const receivable_model_1 = require("../../receivables/model/receivable.model");
class Company {
    id;
    name;
    cnpj;
    email;
    phone;
    created_at;
    updated_at;
    receivables;
    payables;
}
exports.Company = Company;
__decorate([
    (0, class_transformer_1.Type)(() => receivable_model_1.Receivable),
    __metadata("design:type", Array)
], Company.prototype, "receivables", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => payable_model_1.Payable),
    __metadata("design:type", Array)
], Company.prototype, "payables", void 0);
//# sourceMappingURL=company.model.js.map