"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const aircraft_module_1 = require("./aircraft/aircraft.module");
const auth_module_1 = require("./auth/auth.module");
const bills_module_1 = require("./bills/bills.module");
const cnab_module_1 = require("./cnab/cnab.module");
const jwt_config_1 = require("./common/config/jwt.config");
const azure_blob_module_1 = require("./common/providers/azure-blob/azure-blob.module");
const companies_module_1 = require("./companies/companies.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const flights_module_1 = require("./flights/flights.module");
const payable_types_module_1 = require("./payable-types/payable-types.module");
const payables_module_1 = require("./payables/payables.module");
const peoples_module_1 = require("./peoples/peoples.module");
const permissions_module_1 = require("./permissions/permissions.module");
const prisma_module_1 = require("./prisma/prisma.module");
const receivable_types_module_1 = require("./receivable-types/receivable-types.module");
const receivables_module_1 = require("./receivables/receivables.module");
const reports_module_1 = require("./reports/reports.module");
const settings_module_1 = require("./settings/settings.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, load: [jwt_config_1.jwtConfig] }),
            azure_blob_module_1.AzureBlobModule,
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            flights_module_1.FlightsModule,
            receivables_module_1.ReceivablesModule,
            aircraft_module_1.AircraftModule,
            peoples_module_1.PeoplesModule,
            payables_module_1.PayablesModule,
            bills_module_1.BillsModule,
            dashboard_module_1.DashboardModule,
            settings_module_1.SettingsModule,
            companies_module_1.CompaniesModule,
            users_module_1.UsersModule,
            reports_module_1.ReportsModule,
            cnab_module_1.CnabModule,
            receivable_types_module_1.ReceivableTypesModule,
            payable_types_module_1.PayableTypesModule,
            permissions_module_1.PermissionsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map