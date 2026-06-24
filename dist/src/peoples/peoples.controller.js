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
exports.PeoplesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const permissions_1 = require("../common/constants/permissions");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const bulk_delete_dto_1 = require("../common/dto/bulk-delete.dto");
const paginated_response_1 = require("../common/swagger/paginated-response");
const create_people_dto_1 = require("./dto/create-people.dto");
const find_all_peoples_dto_1 = require("./dto/find-all-peoples.dto");
const update_people_dto_1 = require("./dto/update-people.dto");
const people_model_1 = require("./model/people.model");
const peoples_service_1 = require("./peoples.service");
let PeoplesController = class PeoplesController {
    peoplesService;
    constructor(peoplesService) {
        this.peoplesService = peoplesService;
    }
    findAll(query) {
        return this.peoplesService.findAll(query);
    }
    getStats() {
        return this.peoplesService.getStats();
    }
    findOne(id) {
        return this.peoplesService.findOne(id);
    }
    create(dto) {
        return this.peoplesService.create(dto);
    }
    bulkDelete(dto) {
        return this.peoplesService.bulkDelete(dto.ids);
    }
    delete(id) {
        return this.peoplesService.delete(id);
    }
    update(id, dto) {
        return this.peoplesService.update(id, dto);
    }
};
exports.PeoplesController = PeoplesController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.CUSTOMERS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'List people with categories' }),
    (0, swagger_1.ApiResponse)({ type: (0, paginated_response_1.PaginatedResponse)(people_model_1.People) }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_peoples_dto_1.FindAllPeoplesDto]),
    __metadata("design:returntype", void 0)
], PeoplesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.CUSTOMERS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'People statistics' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PeoplesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.CUSTOMERS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Person details' }),
    (0, swagger_1.ApiResponse)({ type: people_model_1.People }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PeoplesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.CUSTOMERS.CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Create person' }),
    (0, swagger_1.ApiResponse)({ type: people_model_1.People }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_people_dto_1.CreatePeopleDto]),
    __metadata("design:returntype", void 0)
], PeoplesController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.CUSTOMERS.DELETE),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete people' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_delete_dto_1.BulkDeleteDto]),
    __metadata("design:returntype", void 0)
], PeoplesController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.CUSTOMERS.DELETE),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete person' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PeoplesController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.CUSTOMERS.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update person' }),
    (0, swagger_1.ApiResponse)({ type: people_model_1.People }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_people_dto_1.UpdatePeopleDto]),
    __metadata("design:returntype", void 0)
], PeoplesController.prototype, "update", null);
exports.PeoplesController = PeoplesController = __decorate([
    (0, swagger_1.ApiTags)('peoples'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('peoples'),
    __metadata("design:paramtypes", [peoples_service_1.PeoplesService])
], PeoplesController);
//# sourceMappingURL=peoples.controller.js.map