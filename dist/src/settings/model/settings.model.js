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
exports.Settings = void 0;
const class_transformer_1 = require("class-transformer");
class Settings {
    id;
    partner_monthly_dues;
    instructor_percentage;
    glider_initial_minutes;
    glider_initial_value;
    glider_minute_value;
}
exports.Settings = Settings;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], Settings.prototype, "partner_monthly_dues", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], Settings.prototype, "instructor_percentage", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], Settings.prototype, "glider_initial_value", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], Settings.prototype, "glider_minute_value", void 0);
//# sourceMappingURL=settings.model.js.map