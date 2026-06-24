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
exports.Bill = void 0;
const class_transformer_1 = require("class-transformer");
const people_model_1 = require("../../peoples/model/people.model");
const receivable_payment_model_1 = require("../../receivables/model/receivable-payment.model");
class Bill {
    id;
    total_amount;
    status;
    expiration_date;
    payment_date;
    payment_method;
    created_at;
    people_id;
    people;
    file_id;
    file;
    receivable_payments;
}
exports.Bill = Bill;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], Bill.prototype, "total_amount", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => people_model_1.People),
    __metadata("design:type", people_model_1.People)
], Bill.prototype, "people", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => receivable_payment_model_1.ReceivablePayment),
    __metadata("design:type", Array)
], Bill.prototype, "receivable_payments", void 0);
//# sourceMappingURL=bill.model.js.map