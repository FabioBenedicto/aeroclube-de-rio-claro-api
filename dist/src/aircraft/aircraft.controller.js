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
exports.AircraftController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const permissions_1 = require("../common/constants/permissions");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const bulk_delete_dto_1 = require("../common/dto/bulk-delete.dto");
const paginated_response_1 = require("../common/swagger/paginated-response");
const aircraft_service_1 = require("./aircraft.service");
const create_aircraft_dto_1 = require("./dto/create-aircraft.dto");
const find_all_aircraft_dto_1 = require("./dto/find-all-aircraft.dto");
const update_aircraft_dto_1 = require("./dto/update-aircraft.dto");
const aircraft_model_1 = require("./model/aircraft.model");
let AircraftController = class AircraftController {
    aircraftService;
    constructor(aircraftService) {
        this.aircraftService = aircraftService;
    }
    findAll(query) {
        return this.aircraftService.findAll(query);
    }
    findOne(id) {
        return this.aircraftService.findOne(id);
    }
    create(dto) {
        return this.aircraftService.create(dto);
    }
    update(id, dto) {
        return this.aircraftService.update(id, dto);
    }
    bulkDelete(dto) {
        return this.aircraftService.bulkDelete(dto.ids);
    }
    delete(id) {
        return this.aircraftService.delete(id);
    }
};
exports.AircraftController = AircraftController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.AIRCRAFT.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'List aircraft' }),
    (0, swagger_1.ApiResponse)({ type: (0, paginated_response_1.PaginatedResponse)(aircraft_model_1.Aircraft) }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_aircraft_dto_1.FindAllAircraftDto]),
    __metadata("design:returntype", void 0)
], AircraftController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.AIRCRAFT.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get aircraft' }),
    (0, swagger_1.ApiResponse)({ type: aircraft_model_1.Aircraft }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AircraftController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.AIRCRAFT.CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Create aircraft' }),
    (0, swagger_1.ApiResponse)({ type: aircraft_model_1.Aircraft }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_aircraft_dto_1.CreateAircraftDto]),
    __metadata("design:returntype", void 0)
], AircraftController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.AIRCRAFT.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update aircraft' }),
    (0, swagger_1.ApiResponse)({ type: aircraft_model_1.Aircraft }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_aircraft_dto_1.UpdateAircraftDto]),
    __metadata("design:returntype", void 0)
], AircraftController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.AIRCRAFT.DELETE),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete aircraft' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_delete_dto_1.BulkDeleteDto]),
    __metadata("design:returntype", void 0)
], AircraftController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.AIRCRAFT.DELETE),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete aircraft' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AircraftController.prototype, "delete", null);
exports.AircraftController = AircraftController = __decorate([
    (0, swagger_1.ApiTags)('aircraft'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('aircraft'),
    __metadata("design:paramtypes", [aircraft_service_1.AircraftService])
], AircraftController);
//# sourceMappingURL=aircraft.controller.js.map