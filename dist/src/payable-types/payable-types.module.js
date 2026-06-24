"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayableTypesModule = void 0;
const common_1 = require("@nestjs/common");
const payable_types_controller_1 = require("./payable-types.controller");
const payable_types_service_1 = require("./payable-types.service");
const payable_types_repository_1 = require("./repository/payable-types.repository");
const payable_types_repository_interface_1 = require("./repository/payable-types-repository.interface");
let PayableTypesModule = class PayableTypesModule {
};
exports.PayableTypesModule = PayableTypesModule;
exports.PayableTypesModule = PayableTypesModule = __decorate([
    (0, common_1.Module)({
        controllers: [payable_types_controller_1.PayableTypesController],
        providers: [
            payable_types_service_1.PayableTypesService,
            {
                provide: payable_types_repository_interface_1.PAYABLE_TYPES_REPOSITORY,
                useClass: payable_types_repository_1.PayableTypesRepository,
            },
        ],
        exports: [payable_types_service_1.PayableTypesService],
    })
], PayableTypesModule);
//# sourceMappingURL=payable-types.module.js.map