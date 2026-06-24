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
exports.Aircraft = void 0;
const class_transformer_1 = require("class-transformer");
const flight_model_1 = require("../../flights/model/flight.model");
const payable_model_1 = require("../../payables/model/payable.model");
const receivable_model_1 = require("../../receivables/model/receivable.model");
class Aircraft {
    id;
    registration;
    model;
    type;
    flight_hour_value;
    created_at;
    updated_at;
    flights;
    payables;
    receivables;
}
exports.Aircraft = Aircraft;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Object)
], Aircraft.prototype, "flight_hour_value", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => flight_model_1.Flight),
    __metadata("design:type", Array)
], Aircraft.prototype, "flights", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => payable_model_1.Payable),
    __metadata("design:type", Array)
], Aircraft.prototype, "payables", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => receivable_model_1.Receivable),
    __metadata("design:type", Array)
], Aircraft.prototype, "receivables", void 0);
//# sourceMappingURL=aircraft.model.js.map