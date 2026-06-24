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
exports.ReportsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const permissions_1 = require("../common/constants/permissions");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const query_report_dto_1 = require("./dto/query-report.dto");
const reports_service_1 = require("./reports.service");
const report_utils_1 = require("./utils/report.utils");
let ReportsController = class ReportsController {
    reportsService;
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    query(dto) {
        return this.reportsService.query(dto);
    }
    async export(dto) {
        const { schema: mergedSchema } = this.reportsService.buildMergedSchema(dto);
        const rows = await this.reportsService.query(dto);
        const keys = rows.length > 0
            ? Object.keys(rows[0])
            : dto.groupBy?.length
                ? []
                : (dto.columns ?? []);
        const columns = keys.map((key) => {
            const f = mergedSchema.find((s) => s.key === key);
            return { header: f?.label ?? key, key, width: 24 };
        });
        const buffer = await (0, report_utils_1.buildExcel)('Report', columns, rows);
        return new common_1.StreamableFile(buffer, {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            disposition: `attachment; filename="${(0, report_utils_1.reportFilename)('report.xlsx')}"`,
        });
    }
    rawQuery(dto) {
        return this.reportsService.rawQuery(dto);
    }
    async rawExport(dto) {
        const rows = await this.reportsService.rawQuery(dto);
        const keys = rows.length > 0 ? Object.keys(rows[0]) : [];
        const columns = keys.map((key) => ({ header: key, key, width: 24 }));
        const buffer = await (0, report_utils_1.buildExcel)('Report', columns, rows);
        return new common_1.StreamableFile(buffer, {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            disposition: `attachment; filename="${(0, report_utils_1.reportFilename)('report-sql.xlsx')}"`,
        });
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Post)('query'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.REPORTS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Execute custom query' }),
    openapi.ApiResponse({ status: 201, type: [Object] }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_report_dto_1.QueryReportDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "query", null);
__decorate([
    (0, common_1.Post)('query/export'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.REPORTS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Export custom query to Excel' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_report_dto_1.QueryReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "export", null);
__decorate([
    (0, common_1.Post)('raw'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.REPORTS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Execute raw SQL (SELECT only)' }),
    openapi.ApiResponse({ status: 201, type: [Object] }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_report_dto_1.RawQueryDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "rawQuery", null);
__decorate([
    (0, common_1.Post)('raw/export'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.REPORTS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Export raw SQL query to Excel' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_report_dto_1.RawQueryDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "rawExport", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('reports'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map