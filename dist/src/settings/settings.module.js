"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsModule = void 0;
const common_1 = require("@nestjs/common");
const settings_repository_1 = require("./repository/settings/settings.repository");
const settings_repository_interface_1 = require("./repository/settings/settings-repository.interface");
const sicoob_settings_repository_1 = require("./repository/sicoob/sicoob-settings.repository");
const sicoob_settings_repository_interface_1 = require("./repository/sicoob/sicoob-settings-repository.interface");
const settings_controller_1 = require("./settings.controller");
const settings_service_1 = require("./settings.service");
let SettingsModule = class SettingsModule {
};
exports.SettingsModule = SettingsModule;
exports.SettingsModule = SettingsModule = __decorate([
    (0, common_1.Module)({
        controllers: [settings_controller_1.SettingsController],
        providers: [
            settings_service_1.SettingsService,
            {
                provide: settings_repository_interface_1.SETTINGS_REPOSITORY,
                useClass: settings_repository_1.SettingsRepository,
            },
            {
                provide: sicoob_settings_repository_interface_1.SICOOB_SETTINGS_REPOSITORY,
                useClass: sicoob_settings_repository_1.SicoobSettingsRepository,
            },
        ],
        exports: [settings_repository_interface_1.SETTINGS_REPOSITORY, sicoob_settings_repository_interface_1.SICOOB_SETTINGS_REPOSITORY],
    })
], SettingsModule);
//# sourceMappingURL=settings.module.js.map