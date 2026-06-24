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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DashboardRepository = class DashboardRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummaryData() {
        const startOfToday = new Date();
        startOfToday.setUTCHours(0, 0, 0, 0);
        const [row] = await this.prisma.$queryRaw `
      SELECT
        (SELECT COALESCE(SUM(total_amount), 0) FROM receivables)                              AS "totalReceivables",
        (SELECT COALESCE(SUM(total_amount), 0) FROM receivables WHERE status = 'PENDING')     AS "openReceivables",
        (SELECT COALESCE(SUM(total_amount), 0) FROM payables)                                 AS "totalPayables",
        (SELECT COALESCE(SUM(total_amount), 0) FROM payables   WHERE status = 'PENDING')      AS "openPayables",
        (SELECT COUNT(*) FROM flights WHERE start_date >= ${startOfToday})                    AS "flightsToday",
        (SELECT COUNT(*) FROM flights WHERE end_date IS NULL)                                 AS "inFlight",
        (SELECT COUNT(*) FROM peoples)                                                        AS "activePeople"
    `;
        return {
            totalReceivables: row.totalReceivables.toNumber(),
            openReceivables: row.openReceivables.toNumber(),
            totalPayables: row.totalPayables.toNumber(),
            openPayables: row.openPayables.toNumber(),
            flightsToday: Number(row.flightsToday),
            inFlight: Number(row.inFlight),
            activePeople: Number(row.activePeople),
        };
    }
};
exports.DashboardRepository = DashboardRepository;
exports.DashboardRepository = DashboardRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardRepository);
//# sourceMappingURL=dashboard.repository.js.map