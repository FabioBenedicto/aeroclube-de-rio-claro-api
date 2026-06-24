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
exports.Payable = void 0;
const class_transformer_1 = require("class-transformer");
const aircraft_model_1 = require("../../aircraft/model/aircraft.model");
const employee_model_1 = require("../../peoples/model/employee.model");
const instructor_model_1 = require("../../peoples/model/instructor.model");
const partner_model_1 = require("../../peoples/model/partner.model");
const people_model_1 = require("../../peoples/model/people.model");
const student_model_1 = require("../../peoples/model/student.model");
const payable_payment_model_1 = require("./payable-payment.model");
class Payable {
    id;
    stakeholder;
    title;
    description;
    payable_type_id;
    payable_type;
    total_amount;
    amount_paid;
    status;
    expiration_date;
    created_at;
    updated_at;
    people;
    student;
    company;
    aircraft;
    instructor;
    partner;
    employee;
    payments;
}
exports.Payable = Payable;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], Payable.prototype, "total_amount", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], Payable.prototype, "amount_paid", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => people_model_1.People),
    __metadata("design:type", Object)
], Payable.prototype, "people", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => student_model_1.Student),
    __metadata("design:type", Object)
], Payable.prototype, "student", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => aircraft_model_1.Aircraft),
    __metadata("design:type", Object)
], Payable.prototype, "aircraft", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => instructor_model_1.Instructor),
    __metadata("design:type", Object)
], Payable.prototype, "instructor", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => partner_model_1.Partner),
    __metadata("design:type", Object)
], Payable.prototype, "partner", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => employee_model_1.Employee),
    __metadata("design:type", Object)
], Payable.prototype, "employee", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => payable_payment_model_1.PayablePayment),
    __metadata("design:type", Array)
], Payable.prototype, "payments", void 0);
//# sourceMappingURL=payable.model.js.map