"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CnabModule = void 0;
const common_1 = require("@nestjs/common");
const bills_module_1 = require("../bills/bills.module");
const prisma_module_1 = require("../prisma/prisma.module");
const settings_module_1 = require("../settings/settings.module");
const cnab_controller_1 = require("./cnab.controller");
const cnab_service_1 = require("./cnab.service");
const cnab_repository_interface_1 = require("./repository/cnab-repository.interface");
const cnab_repository_1 = require("./repository/cnab.repository");
let CnabModule = class CnabModule {
};
exports.CnabModule = CnabModule;
exports.CnabModule = CnabModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, bills_module_1.BillsModule, settings_module_1.SettingsModule],
        controllers: [cnab_controller_1.CnabController],
        providers: [cnab_service_1.CnabService, { provide: cnab_repository_interface_1.CNAB_REPOSITORY, useClass: cnab_repository_1.CnabRepository }],
    })
], CnabModule);
//# sourceMappingURL=cnab.module.js.map