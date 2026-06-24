"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillsModule = void 0;
const common_1 = require("@nestjs/common");
const bills_controller_1 = require("./bills.controller");
const bills_service_1 = require("./bills.service");
const bills_repository_1 = require("./repository/bills.repository");
const bills_repository_interface_1 = require("./repository/bills-repository.interface");
let BillsModule = class BillsModule {
};
exports.BillsModule = BillsModule;
exports.BillsModule = BillsModule = __decorate([
    (0, common_1.Module)({
        controllers: [bills_controller_1.BillsController],
        providers: [
            bills_service_1.BillsService,
            {
                provide: bills_repository_interface_1.BILLS_REPOSITORY,
                useClass: bills_repository_1.BillsRepository,
            },
        ],
        exports: [bills_repository_interface_1.BILLS_REPOSITORY],
    })
], BillsModule);
//# sourceMappingURL=bills.module.js.map