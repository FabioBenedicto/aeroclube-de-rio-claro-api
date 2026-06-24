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
exports.UpdateAircraftDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const aircraft_type_enum_1 = require("../enums/aircraft-type.enum");
class UpdateAircraftDto {
    registration;
    model;
    type;
    flight_hour_value;
    static _OPENAPI_METADATA_FACTORY() {
        return { registration: { required: false, type: () => String, maxLength: 10 }, model: { required: false, type: () => String }, type: { required: true, enum: require("../enums/aircraft-type.enum").EAircraftType }, flight_hour_value: { required: false, type: () => Number, minimum: 0.01 } };
    }
}
exports.UpdateAircraftDto = UpdateAircraftDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], UpdateAircraftDto.prototype, "registration", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAircraftDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(aircraft_type_enum_1.EAircraftType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAircraftDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type === aircraft_type_enum_1.EAircraftType.AIRPLANE),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAircraftDto.prototype, "flight_hour_value", void 0);
//# sourceMappingURL=update-aircraft.dto.js.map