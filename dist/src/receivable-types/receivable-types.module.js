"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceivableTypesModule = void 0;
const common_1 = require("@nestjs/common");
const receivable_types_controller_1 = require("./receivable-types.controller");
const receivable_types_service_1 = require("./receivable-types.service");
const receivable_types_repository_1 = require("./repository/receivable-types.repository");
const receivable_types_repository_interface_1 = require("./repository/receivable-types-repository.interface");
let ReceivableTypesModule = class ReceivableTypesModule {
};
exports.ReceivableTypesModule = ReceivableTypesModule;
exports.ReceivableTypesModule = ReceivableTypesModule = __decorate([
    (0, common_1.Module)({
        controllers: [receivable_types_controller_1.ReceivableTypesController],
        providers: [
            receivable_types_service_1.ReceivableTypesService,
            {
                provide: receivable_types_repository_interface_1.RECEIVABLE_TYPES_REPOSITORY,
                useClass: receivable_types_repository_1.ReceivableTypesRepository,
            },
        ],
        exports: [receivable_types_service_1.ReceivableTypesService],
    })
], ReceivableTypesModule);
//# sourceMappingURL=receivable-types.module.js.map