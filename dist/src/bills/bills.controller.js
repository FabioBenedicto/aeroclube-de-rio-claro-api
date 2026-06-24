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
exports.BillsController = void 0;
const openapi = require("@nestjs/swagger");
const azure_blob_service_interface_1 = require("../common/providers/azure-blob/azure-blob.service.interface");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const azure_blob_service_1 = require("../common/providers/azure-blob/azure-blob.service");
const bulk_delete_dto_1 = require("../common/dto/bulk-delete.dto");
const paginated_response_1 = require("../common/swagger/paginated-response");
const bills_service_1 = require("./bills.service");
const create_bill_dto_1 = require("./dto/create-bill.dto");
const find_all_bills_dto_1 = require("./dto/find-all-bills.dto");
const pay_bill_dto_1 = require("./dto/pay-bill.dto");
const update_bill_dto_1 = require("./dto/update-bill.dto");
const bill_model_1 = require("./model/bill.model");
let BillsController = class BillsController {
    billsService;
    azureBlobService;
    constructor(billsService, azureBlobService) {
        this.billsService = billsService;
        this.azureBlobService = azureBlobService;
    }
    findAll(query) {
        return this.billsService.findAll(query);
    }
    findOne(id) {
        return this.billsService.findOne(id);
    }
    create(dto) {
        return this.billsService.create(dto);
    }
    update(id, dto) {
        return this.billsService.update(id, dto);
    }
    bulkDelete(dto) {
        return this.billsService.bulkDelete(dto.ids);
    }
    delete(id) {
        return this.billsService.delete(id);
    }
    pay(id, dto) {
        return this.billsService.pay(id, dto);
    }
    async uploadInvoice(id, file) {
        const bill = await this.billsService.findOne(id);
        if (bill.file) {
            await this.azureBlobService.delete(bill.file.blob_path);
        }
        const blobPath = this.azureBlobService.buildBlobPath('invoices/bills', id, file.originalname);
        const url = await this.azureBlobService.upload(blobPath, file.buffer, file.mimetype);
        return this.billsService.attachInvoice(id, {
            url,
            blob_path: blobPath,
            original_name: file.originalname,
            mime_type: file.mimetype,
            size: file.size,
        });
    }
    async deleteInvoice(id) {
        const bill = await this.billsService.findOne(id);
        if (bill.file) {
            await this.azureBlobService.delete(bill.file.blob_path);
        }
        await this.billsService.deleteInvoice(id);
    }
};
exports.BillsController = BillsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List bills' }),
    (0, swagger_1.ApiResponse)({ type: (0, paginated_response_1.PaginatedResponse)(bill_model_1.Bill) }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_bills_dto_1.FindAllBillsDto]),
    __metadata("design:returntype", void 0)
], BillsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get bill' }),
    (0, swagger_1.ApiResponse)({ type: bill_model_1.Bill }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], BillsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create bill' }),
    (0, swagger_1.ApiResponse)({ type: bill_model_1.Bill }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bill_dto_1.CreateBillDto]),
    __metadata("design:returntype", void 0)
], BillsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update bill' }),
    (0, swagger_1.ApiResponse)({ type: bill_model_1.Bill }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_bill_dto_1.UpdateBillDto]),
    __metadata("design:returntype", void 0)
], BillsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete bills' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_delete_dto_1.BulkDeleteDto]),
    __metadata("design:returntype", void 0)
], BillsController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete bill' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], BillsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/pay'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Pay bill' }),
    (0, swagger_1.ApiResponse)({ type: bill_model_1.Bill }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, pay_bill_dto_1.PayBillDto]),
    __metadata("design:returntype", void 0)
], BillsController.prototype, "pay", null);
__decorate([
    (0, common_1.Post)(':id/invoice'),
    (0, swagger_1.ApiOperation)({ summary: 'Attach invoice to bill' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /(pdf|jpeg|png)/ }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BillsController.prototype, "uploadInvoice", null);
__decorate([
    (0, common_1.Delete)(':id/invoice'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove invoice from bill' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BillsController.prototype, "deleteInvoice", null);
exports.BillsController = BillsController = __decorate([
    (0, swagger_1.ApiTags)('bills'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('bills'),
    __param(1, (0, common_1.Inject)(azure_blob_service_interface_1.AZURE_BLOB_SERVICE)),
    __metadata("design:paramtypes", [bills_service_1.BillsService,
        azure_blob_service_1.AzureBlobService])
], BillsController);
//# sourceMappingURL=bills.controller.js.map