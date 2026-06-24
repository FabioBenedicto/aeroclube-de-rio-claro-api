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
exports.CnabController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_enum_1 = require("../users/enums/roles.enum");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const paginated_response_1 = require("../common/swagger/paginated-response");
const cnab_service_1 = require("./cnab.service");
const generate_remessa_dto_1 = require("./dto/generate-remessa.dto");
const cnab_remittent_model_1 = require("./model/cnab-remittent.model");
let CnabController = class CnabController {
    cnabService;
    constructor(cnabService) {
        this.cnabService = cnabService;
    }
    listRemittent(page = '1', limit = '20') {
        return this.cnabService.listRemittent(Number(page), Number(limit));
    }
    generateRemittent(dto) {
        return this.cnabService.generateRemittent(dto);
    }
    getRemittentDetail(id) {
        return this.cnabService.getRemittentDetail(id);
    }
    async downloadRemittent(id) {
        const { buffer, filename } = await this.cnabService.downloadRemessa(id);
        return new common_1.StreamableFile(buffer, {
            type: 'application/octet-stream',
            disposition: `attachment; filename="${filename}"`,
            length: buffer.length,
        });
    }
    deleteRemittent(id) {
        return this.cnabService.deleteRemittent(id);
    }
};
exports.CnabController = CnabController;
__decorate([
    openapi.ApiQuery({ name: "page", required: false }),
    openapi.ApiQuery({ name: "limit", required: false }),
    (0, common_1.Get)('remittent'),
    (0, roles_decorator_1.Roles)(roles_enum_1.ERoles.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'List generated CNAB remessa files' }),
    (0, swagger_1.ApiResponse)({ type: (0, paginated_response_1.PaginatedResponse)(cnab_remittent_model_1.CnabRemittent) }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CnabController.prototype, "listRemittent", null);
__decorate([
    (0, common_1.Post)('remittent'),
    (0, roles_decorator_1.Roles)(roles_enum_1.ERoles.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Generate CNAB 240 Remittent file for Sicoob' }),
    (0, swagger_1.ApiResponse)({ type: cnab_remittent_model_1.CnabRemittent }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_remessa_dto_1.GenerateRemessaDto]),
    __metadata("design:returntype", void 0)
], CnabController.prototype, "generateRemittent", null);
__decorate([
    (0, common_1.Get)('remittent/:id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.ERoles.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get CNAB Remittent with associated bills' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CnabController.prototype, "getRemittentDetail", null);
__decorate([
    (0, common_1.Get)('remittent/:id/download'),
    (0, roles_decorator_1.Roles)(roles_enum_1.ERoles.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Download Remittent file' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CnabController.prototype, "downloadRemittent", null);
__decorate([
    (0, common_1.Delete)('remittent/:id'),
    (0, roles_decorator_1.Roles)(roles_enum_1.ERoles.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete CNAB Remittent and revert bills to open' }),
    openapi.ApiResponse({ status: 200, type: require("./model/cnab-remittent.model").CnabRemittent }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CnabController.prototype, "deleteRemittent", null);
exports.CnabController = CnabController = __decorate([
    (0, swagger_1.ApiTags)('cnab'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('cnab'),
    __metadata("design:paramtypes", [cnab_service_1.CnabService])
], CnabController);
//# sourceMappingURL=cnab.controller.js.map