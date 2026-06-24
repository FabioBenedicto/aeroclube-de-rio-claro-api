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
exports.SicoobSettingsRepository = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const prisma_service_1 = require("../../../prisma/prisma.service");
const sicoob_settings_model_1 = require("../../model/sicoob-settings.model");
let SicoobSettingsRepository = class SicoobSettingsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async find() {
        const raw = await this.prisma.sicoobSettings.findUnique({
            where: { id: 1 },
        });
        return raw ? (0, class_transformer_1.plainToInstance)(sicoob_settings_model_1.SicoobSettings, raw) : null;
    }
    async upsert(dto) {
        const raw = await this.prisma.sicoobSettings.upsert({
            where: { id: 1 },
            create: { id: 1, ...dto },
            update: dto,
        });
        return (0, class_transformer_1.plainToInstance)(sicoob_settings_model_1.SicoobSettings, raw);
    }
    async incrementRemittanceSequence() {
        const raw = await this.prisma.sicoobSettings.upsert({
            where: { id: 1 },
            create: { id: 1, remittance_sequence: 1 },
            update: { remittance_sequence: { increment: 1 } },
        });
        return (0, class_transformer_1.plainToInstance)(sicoob_settings_model_1.SicoobSettings, raw);
    }
};
exports.SicoobSettingsRepository = SicoobSettingsRepository;
exports.SicoobSettingsRepository = SicoobSettingsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SicoobSettingsRepository);
//# sourceMappingURL=sicoob-settings.repository.js.map