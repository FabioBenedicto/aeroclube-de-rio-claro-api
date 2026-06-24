"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayablesModule = void 0;
const common_1 = require("@nestjs/common");
const payables_controller_1 = require("./payables.controller");
const payables_service_1 = require("./payables.service");
const payables_repository_interface_1 = require("./repository/payables-repository.interface");
const payables_repository_1 = require("./repository/payables.repository");
let PayablesModule = class PayablesModule {
};
exports.PayablesModule = PayablesModule;
exports.PayablesModule = PayablesModule = __decorate([
    (0, common_1.Module)({
        controllers: [payables_controller_1.PayablesController],
        providers: [payables_service_1.PayablesService, { provide: payables_repository_interface_1.PAYABLES_REPOSITORY, useClass: payables_repository_1.PayablesRepository }],
    })
], PayablesModule);
//# sourceMappingURL=payables.module.js.map