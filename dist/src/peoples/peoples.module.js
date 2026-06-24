"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeoplesModule = void 0;
const common_1 = require("@nestjs/common");
const peoples_controller_1 = require("./peoples.controller");
const peoples_service_1 = require("./peoples.service");
const peoples_repository_1 = require("./repository/peoples/peoples.repository");
const peoples_repository_interface_1 = require("./repository/peoples/peoples-repository.interface");
let PeoplesModule = class PeoplesModule {
};
exports.PeoplesModule = PeoplesModule;
exports.PeoplesModule = PeoplesModule = __decorate([
    (0, common_1.Module)({
        controllers: [peoples_controller_1.PeoplesController],
        providers: [
            peoples_service_1.PeoplesService,
            {
                provide: peoples_repository_interface_1.PEOPLES_REPOSITORY,
                useClass: peoples_repository_1.PeoplesRepository,
            },
        ],
    })
], PeoplesModule);
//# sourceMappingURL=peoples.module.js.map