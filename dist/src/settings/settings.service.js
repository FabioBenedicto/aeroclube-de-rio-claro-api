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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const settings_repository_interface_1 = require("./repository/settings/settings-repository.interface");
const sicoob_settings_repository_interface_1 = require("./repository/sicoob/sicoob-settings-repository.interface");
let SettingsService = class SettingsService {
    settingsRepository;
    sicoobSettingsRepository;
    constructor(settingsRepository, sicoobSettingsRepository) {
        this.settingsRepository = settingsRepository;
        this.sicoobSettingsRepository = sicoobSettingsRepository;
    }
    async getSettings() {
        const settings = await this.settingsRepository.find();
        if (!settings)
            throw new common_1.NotFoundException('Configurações ainda não definidas');
        return settings;
    }
    upsertSettings(dto) {
        return this.settingsRepository.upsert(dto);
    }
    async getSicoobSettings() {
        const sicoobSettings = await this.sicoobSettingsRepository.find();
        if (!sicoobSettings)
            throw new common_1.NotFoundException('Configurações do Sicoob ainda não definidas');
        return sicoobSettings;
    }
    upsertSicoobSettings(dto) {
        return this.sicoobSettingsRepository.upsert(dto);
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(settings_repository_interface_1.SETTINGS_REPOSITORY)),
    __param(1, (0, common_1.Inject)(sicoob_settings_repository_interface_1.SICOOB_SETTINGS_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], SettingsService);
//# sourceMappingURL=settings.service.js.map