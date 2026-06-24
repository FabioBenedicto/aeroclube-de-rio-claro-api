"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeSicoobSettingsRepository = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const sicoob_settings_model_1 = require("../../model/sicoob-settings.model");
const defaultSicoobSettings = {
    id: 1,
    cooperative_prefix: null,
    cooperative_digit: null,
    branch: null,
    account: null,
    account_digit: null,
    wallet: null,
    modality: null,
    cnpj: null,
    company_name: null,
    remittance_sequence: 0,
    interest_rate: 0,
    interest_period: 0,
    interest_type: '2',
};
let FakeSicoobSettingsRepository = class FakeSicoobSettingsRepository {
    sicoobSettings = null;
    async find() {
        return this.sicoobSettings;
    }
    async upsert(dto) {
        const base = this.sicoobSettings ?? defaultSicoobSettings;
        this.sicoobSettings = (0, class_transformer_1.plainToInstance)(sicoob_settings_model_1.SicoobSettings, { ...base, ...dto });
        return this.sicoobSettings;
    }
    async incrementRemittanceSequence() {
        if (!this.sicoobSettings)
            this.sicoobSettings = defaultSicoobSettings;
        this.sicoobSettings = (0, class_transformer_1.plainToInstance)(sicoob_settings_model_1.SicoobSettings, {
            ...this.sicoobSettings,
            remittance_sequence: this.sicoobSettings.remittance_sequence + 1,
        });
        return this.sicoobSettings;
    }
};
exports.FakeSicoobSettingsRepository = FakeSicoobSettingsRepository;
exports.FakeSicoobSettingsRepository = FakeSicoobSettingsRepository = __decorate([
    (0, common_1.Injectable)()
], FakeSicoobSettingsRepository);
//# sourceMappingURL=fake-sicoob-settings.repository.js.map