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
exports.ReceivableTypesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const permissions_1 = require("../common/constants/permissions");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const create_receivable_type_dto_1 = require("./dto/create-receivable-type.dto");
const update_receivable_type_dto_1 = require("./dto/update-receivable-type.dto");
const receivable_types_service_1 = require("./receivable-types.service");
let ReceivableTypesController = class ReceivableTypesController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll() {
        return this.service.findAll();
    }
    create(dto) {
        return this.service.create(dto);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    delete(id) {
        return this.service.delete(id);
    }
};
exports.ReceivableTypesController = ReceivableTypesController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.TITLE_TYPES.VIEW),
    openapi.ApiResponse({ status: 200, type: [require("./model/receivable-type.model").ReceivableType] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReceivableTypesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.TITLE_TYPES.CREATE),
    openapi.ApiResponse({ status: 201, type: require("./model/receivable-type.model").ReceivableType }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_receivable_type_dto_1.CreateReceivableTypeDto]),
    __metadata("design:returntype", void 0)
], ReceivableTypesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.TITLE_TYPES.UPDATE),
    openapi.ApiResponse({ status: 200, type: require("./model/receivable-type.model").ReceivableType }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_receivable_type_dto_1.UpdateReceivableTypeDto]),
    __metadata("design:returntype", void 0)
], ReceivableTypesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.TITLE_TYPES.DELETE),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReceivableTypesController.prototype, "delete", null);
exports.ReceivableTypesController = ReceivableTypesController = __decorate([
    (0, swagger_1.ApiTags)('receivable-types'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('receivable-types'),
    __metadata("design:paramtypes", [receivable_types_service_1.ReceivableTypesService])
], ReceivableTypesController);
//# sourceMappingURL=receivable-types.controller.js.map