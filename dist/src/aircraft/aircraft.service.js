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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AircraftService = void 0;
const common_1 = require("@nestjs/common");
const aircraft_type_enum_1 = require("./enums/aircraft-type.enum");
const aircraft_repository_interface_1 = require("./repository/aircraft-repository.interface");
let AircraftService = class AircraftService {
    aircraftRepository;
    constructor(aircraftRepository) {
        this.aircraftRepository = aircraftRepository;
    }
    findAll(query) {
        return this.aircraftRepository.findAll(query);
    }
    async findOne(id) {
        const aircraft = await this.aircraftRepository.findById(id);
        if (!aircraft) {
            throw new common_1.NotFoundException(`Aeronave ${id} não encontrada`);
        }
        return aircraft;
    }
    async create(dto) {
        const registrationOwner = await this.aircraftRepository.findByRegistration(dto.registration);
        if (registrationOwner) {
            throw new common_1.ConflictException('Matrícula já cadastrada');
        }
        if (dto.type !== aircraft_type_enum_1.EAircraftType.GLIDER && !dto.flight_hour_value) {
            throw new common_1.BadRequestException('Valor da hora de voo é obrigatório para aviões');
        }
        return this.aircraftRepository.create(dto);
    }
    async delete(id) {
        await this.findOne(id);
        return this.aircraftRepository.delete(id);
    }
    async update(id, dto) {
        await this.findOne(id);
        if (dto.registration) {
            const registrationOwner = await this.aircraftRepository.findByRegistration(dto.registration);
            if (registrationOwner && registrationOwner.id !== id) {
                throw new common_1.ConflictException('Prefixo já cadastrado');
            }
        }
        return this.aircraftRepository.update(id, dto);
    }
    bulkDelete(ids) {
        return this.aircraftRepository.bulkDelete(ids);
    }
};
exports.AircraftService = AircraftService;
exports.AircraftService = AircraftService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(aircraft_repository_interface_1.AIRCRAFT_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], AircraftService);
//# sourceMappingURL=aircraft.service.js.map