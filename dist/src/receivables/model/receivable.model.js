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
exports.Receivable = void 0;
const class_transformer_1 = require("class-transformer");
const aircraft_model_1 = require("../../aircraft/model/aircraft.model");
const flight_model_1 = require("../../flights/model/flight.model");
const employee_model_1 = require("../../peoples/model/employee.model");
const instructor_model_1 = require("../../peoples/model/instructor.model");
const partner_model_1 = require("../../peoples/model/partner.model");
const people_model_1 = require("../../peoples/model/people.model");
const student_model_1 = require("../../peoples/model/student.model");
const receivable_payment_model_1 = require("./receivable-payment.model");
class Receivable {
    id;
    stakeholder;
    title;
    description;
    receivable_type_id;
    receivable_type;
    adds_credit;
    total_amount;
    amount_received;
    status;
    expiration_date;
    created_at;
    updated_at;
    people_id;
    people;
    student_id;
    student;
    partner_id;
    partner;
    instructor_id;
    instructor;
    employee_id;
    employee;
    company_id;
    company;
    aircraft_id;
    aircraft;
    flight_id;
    flight;
    payments;
}
exports.Receivable = Receivable;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], Receivable.prototype, "total_amount", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], Receivable.prototype, "amount_received", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => people_model_1.People),
    __metadata("design:type", Object)
], Receivable.prototype, "people", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => student_model_1.Student),
    __metadata("design:type", Object)
], Receivable.prototype, "student", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => partner_model_1.Partner),
    __metadata("design:type", Object)
], Receivable.prototype, "partner", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => instructor_model_1.Instructor),
    __metadata("design:type", Object)
], Receivable.prototype, "instructor", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => employee_model_1.Employee),
    __metadata("design:type", Object)
], Receivable.prototype, "employee", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => aircraft_model_1.Aircraft),
    __metadata("design:type", Object)
], Receivable.prototype, "aircraft", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => flight_model_1.Flight),
    __metadata("design:type", Object)
], Receivable.prototype, "flight", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => receivable_payment_model_1.ReceivablePayment),
    __metadata("design:type", Array)
], Receivable.prototype, "payments", void 0);
//# sourceMappingURL=receivable.model.js.map