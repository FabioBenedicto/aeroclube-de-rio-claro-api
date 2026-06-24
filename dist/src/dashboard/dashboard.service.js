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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const dashboard_repository_interface_1 = require("./repository/dashboard-repository.interface");
let DashboardService = class DashboardService {
    dashboardRepository;
    constructor(dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }
    async getSummary() {
        const d = await this.dashboardRepository.getSummaryData();
        return {
            receivables: { total: d.totalReceivables, open: d.openReceivables },
            payables: { total: d.totalPayables, open: d.openPayables },
            flights: { today: d.flightsToday, in_flight: d.inFlight },
            people: d.activePeople,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(dashboard_repository_interface_1.DASHBOARD_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map