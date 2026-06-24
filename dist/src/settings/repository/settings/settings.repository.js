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
exports.SettingsRepository = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const prisma_service_1 = require("../../../prisma/prisma.service");
const settings_model_1 = require("../../model/settings.model");
let SettingsRepository = class SettingsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async find() {
        const raw = await this.prisma.settings.findUnique({ where: { id: 1 } });
        return raw ? (0, class_transformer_1.plainToInstance)(settings_model_1.Settings, raw) : null;
    }
    async upsert(dto) {
        const raw = await this.prisma.settings.upsert({
            where: { id: 1 },
            create: { id: 1 },
            update: dto,
        });
        return (0, class_transformer_1.plainToInstance)(settings_model_1.Settings, raw);
    }
};
exports.SettingsRepository = SettingsRepository;
exports.SettingsRepository = SettingsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsRepository);
//# sourceMappingURL=settings.repository.js.map