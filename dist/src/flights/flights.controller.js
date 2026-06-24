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
exports.FlightsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const permissions_1 = require("../common/constants/permissions");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const bulk_delete_dto_1 = require("../common/dto/bulk-delete.dto");
const paginated_response_1 = require("../common/swagger/paginated-response");
const create_flight_dto_1 = require("./dto/create-flight.dto");
const find_all_flights_dto_1 = require("./dto/find-all-flights.dto");
const update_flight_dto_1 = require("./dto/update-flight.dto");
const flights_service_1 = require("./flights.service");
const flight_model_1 = require("./model/flight.model");
let FlightsController = class FlightsController {
    flightsService;
    constructor(flightsService) {
        this.flightsService = flightsService;
    }
    findAll(query) {
        return this.flightsService.findAll(query);
    }
    getStats(query) {
        return this.flightsService.getStats(query);
    }
    findOne(id) {
        return this.flightsService.findOne(id);
    }
    create(dto) {
        return this.flightsService.registerFlight(dto);
    }
    update(id, dto) {
        return this.flightsService.update(id, dto);
    }
    bulkRemove(dto) {
        return this.flightsService.bulkRemove(dto.ids);
    }
    remove(id) {
        return this.flightsService.remove(id);
    }
};
exports.FlightsController = FlightsController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.FLIGHTS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'List flights' }),
    (0, swagger_1.ApiResponse)({ type: (0, paginated_response_1.PaginatedResponse)(flight_model_1.Flight) }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_flights_dto_1.FindAllFlightsDto]),
    __metadata("design:returntype", void 0)
], FlightsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.FLIGHTS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get flight stats (total count and total hours)' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_flights_dto_1.FindAllFlightsDto]),
    __metadata("design:returntype", void 0)
], FlightsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.FLIGHTS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get flight' }),
    (0, swagger_1.ApiResponse)({ type: flight_model_1.Flight }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FlightsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.FLIGHTS.CREATE),
    (0, swagger_1.ApiOperation)({
        summary: 'Create flight and financial titles',
    }),
    (0, swagger_1.ApiResponse)({ type: flight_model_1.Flight }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_flight_dto_1.CreateFlightDto]),
    __metadata("design:returntype", void 0)
], FlightsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.FLIGHTS.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update flight and financial titles' }),
    (0, swagger_1.ApiResponse)({ type: flight_model_1.Flight }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_flight_dto_1.UpdateFlightDto]),
    __metadata("design:returntype", void 0)
], FlightsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.FLIGHTS.DELETE),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete flights' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_delete_dto_1.BulkDeleteDto]),
    __metadata("design:returntype", void 0)
], FlightsController.prototype, "bulkRemove", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.FLIGHTS.DELETE),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete flight financial titles' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FlightsController.prototype, "remove", null);
exports.FlightsController = FlightsController = __decorate([
    (0, swagger_1.ApiTags)('flights'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('flights'),
    __metadata("design:paramtypes", [flights_service_1.FlightsService])
], FlightsController);
//# sourceMappingURL=flights.controller.js.map