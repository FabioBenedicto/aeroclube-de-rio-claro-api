"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeSettingsRepository = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const settings_model_1 = require("../../model/settings.model");
const defaultSettings = {
    id: 1,
    instructor_percentage: 0,
    glider_initial_minutes: 0,
    glider_initial_value: 0,
    glider_minute_value: 0,
};
let FakeSettingsRepository = class FakeSettingsRepository {
    settings = null;
    async find() {
        return this.settings;
    }
    async upsert(dto) {
        const base = this.settings ?? defaultSettings;
        this.settings = (0, class_transformer_1.plainToInstance)(settings_model_1.Settings, { ...base, ...dto });
        return this.settings;
    }
};
exports.FakeSettingsRepository = FakeSettingsRepository;
exports.FakeSettingsRepository = FakeSettingsRepository = __decorate([
    (0, common_1.Injectable)()
], FakeSettingsRepository);
//# sourceMappingURL=fake-settings.repository.js.map