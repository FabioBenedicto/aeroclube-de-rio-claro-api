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
exports.People = void 0;
const class_transformer_1 = require("class-transformer");
const receivable_model_1 = require("../../receivables/model/receivable.model");
const address_model_1 = require("./address.model");
const employee_model_1 = require("./employee.model");
const instructor_model_1 = require("./instructor.model");
const partner_model_1 = require("./partner.model");
const student_model_1 = require("./student.model");
class People {
    id;
    cpf;
    name;
    email;
    phone_number;
    credit_balance;
    created_at;
    updated_at;
    address;
    instructors;
    students;
    partners;
    employees;
    receivables;
    categories;
}
exports.People = People;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_transformer_1.Transform)(({ value }) => (value != null ? Number(value) : null)),
    __metadata("design:type", Object)
], People.prototype, "credit_balance", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => address_model_1.Address),
    __metadata("design:type", Object)
], People.prototype, "address", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => instructor_model_1.Instructor),
    __metadata("design:type", Object)
], People.prototype, "instructors", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => student_model_1.Student),
    __metadata("design:type", Object)
], People.prototype, "students", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => partner_model_1.Partner),
    __metadata("design:type", Object)
], People.prototype, "partners", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => employee_model_1.Employee),
    __metadata("design:type", Object)
], People.prototype, "employees", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => receivable_model_1.Receivable),
    __metadata("design:type", Array)
], People.prototype, "receivables", void 0);
//# sourceMappingURL=people.model.js.map