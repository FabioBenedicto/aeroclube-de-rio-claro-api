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
exports.SettingsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const permissions_1 = require("../common/constants/permissions");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const upsert_settings_dto_1 = require("./dto/upsert-settings.dto");
const upsert_sicoob_settings_dto_1 = require("./dto/upsert-sicoob-settings.dto");
const settings_service_1 = require("./settings.service");
let SettingsController = class SettingsController {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    get() {
        return this.settingsService.getSettings();
    }
    upsert(dto) {
        return this.settingsService.upsertSettings(dto);
    }
    getSicoob() {
        return this.settingsService.getSicoobSettings();
    }
    upsertSicoob(dto) {
        return this.settingsService.upsertSicoobSettings(dto);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.SETTINGS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get settings' }),
    openapi.ApiResponse({ status: 200, type: require("./model/settings.model").Settings }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.SETTINGS.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Save settings' }),
    openapi.ApiResponse({ status: 200, type: require("./model/settings.model").Settings }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_settings_dto_1.UpsertSettingsDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "upsert", null);
__decorate([
    (0, common_1.Get)('sicoob'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.SETTINGS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get Sicoob settings' }),
    openapi.ApiResponse({ status: 200, type: require("./model/sicoob-settings.model").SicoobSettings }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getSicoob", null);
__decorate([
    (0, common_1.Put)('sicoob'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.SETTINGS.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Save Sicoob settings' }),
    openapi.ApiResponse({ status: 200, type: require("./model/sicoob-settings.model").SicoobSettings }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [upsert_sicoob_settings_dto_1.UpsertSicoobSettingsDto]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "upsertSicoob", null);
exports.SettingsController = SettingsController = __decorate([
    (0, swagger_1.ApiTags)('settings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map