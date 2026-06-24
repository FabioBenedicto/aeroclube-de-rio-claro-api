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
exports.ReceivablesController = void 0;
const openapi = require("@nestjs/swagger");
const azure_blob_service_interface_1 = require("../common/providers/azure-blob/azure-blob.service.interface");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const permissions_1 = require("../common/constants/permissions");
const require_permission_decorator_1 = require("../common/decorators/require-permission.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const bulk_delete_dto_1 = require("../common/dto/bulk-delete.dto");
const azure_blob_service_1 = require("../common/providers/azure-blob/azure-blob.service");
const paginated_response_1 = require("../common/swagger/paginated-response");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const create_receivable_dto_1 = require("./dto/create-receivable.dto");
const find_all_receivables_dto_1 = require("./dto/find-all-receivables.dto");
const update_receivable_dto_1 = require("./dto/update-receivable.dto");
const receivable_model_1 = require("./model/receivable.model");
const receivables_service_1 = require("./receivables.service");
let ReceivablesController = class ReceivablesController {
    receivablesService;
    azureBlob;
    constructor(receivablesService, azureBlob) {
        this.receivablesService = receivablesService;
        this.azureBlob = azureBlob;
    }
    findAll(query) {
        return this.receivablesService.findAll(query);
    }
    findOne(id) {
        return this.receivablesService.findOne(id);
    }
    create(dto) {
        return this.receivablesService.create(dto);
    }
    update(id, dto) {
        return this.receivablesService.update(id, dto);
    }
    bulkDelete(dto) {
        return this.receivablesService.bulkDelete(dto.ids);
    }
    delete(id) {
        return this.receivablesService.delete(id);
    }
    createPayment(id, dto) {
        return this.receivablesService.createPayment(id, dto);
    }
    deletePayment(_id, paymentId) {
        return this.receivablesService.deletePayment(paymentId);
    }
    async attachPaymentInvoice(paymentId, file) {
        const payment = await this.receivablesService.getPayment(paymentId);
        if (payment.file) {
            await this.azureBlob.delete(payment.file.blob_path);
        }
        const blobPath = this.azureBlob.buildBlobPath('invoices/receivable-payments', paymentId, file.originalname);
        const url = await this.azureBlob.upload(blobPath, file.buffer, file.mimetype);
        return this.receivablesService.attachPaymentInvoice(paymentId, {
            url,
            blob_path: blobPath,
            original_name: file.originalname,
            mime_type: file.mimetype,
            size: file.size,
        });
    }
    async removePaymentInvoice(paymentId) {
        const payment = await this.receivablesService.getPayment(paymentId);
        if (payment.file) {
            await this.azureBlob.delete(payment.file.blob_path);
        }
        await this.receivablesService.removePaymentInvoice(paymentId);
    }
};
exports.ReceivablesController = ReceivablesController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.RECEIVABLES.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'List receivables' }),
    (0, swagger_1.ApiResponse)({ type: (0, paginated_response_1.PaginatedResponse)(receivable_model_1.Receivable) }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_receivables_dto_1.FindAllReceivablesDto]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.RECEIVABLES.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get receivable' }),
    (0, swagger_1.ApiResponse)({ type: receivable_model_1.Receivable }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.RECEIVABLES.CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Create receivable' }),
    (0, swagger_1.ApiResponse)({ type: receivable_model_1.Receivable }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_receivable_dto_1.CreateReceivableDto]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.RECEIVABLES.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update receivable' }),
    (0, swagger_1.ApiResponse)({ type: receivable_model_1.Receivable }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_receivable_dto_1.UpdateReceivableDto]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.RECEIVABLES.DELETE),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete receivables' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_delete_dto_1.BulkDeleteDto]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.RECEIVABLES.DELETE),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete receivable' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/payments'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.RECEIVABLES.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Create receivable payment' }),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_payment_dto_1.CreateReceivablePaymentDto]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Delete)(':id/payments/:paymentId'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.RECEIVABLES.UPDATE),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Reverse receivable payment' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('paymentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ReceivablesController.prototype, "deletePayment", null);
__decorate([
    (0, common_1.Post)(':id/payments/:paymentId/invoice'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.RECEIVABLES.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Attach invoice to payment' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    openapi.ApiResponse({ status: 201, type: require("./model/receivable-payment.model").ReceivablePayment }),
    __param(0, (0, common_1.Param)('paymentId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /(pdf|jpeg|png)/ }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReceivablesController.prototype, "attachPaymentInvoice", null);
__decorate([
    (0, common_1.Delete)(':id/payments/:paymentId/invoice'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.RECEIVABLES.UPDATE),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove invoice from payment' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('paymentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReceivablesController.prototype, "removePaymentInvoice", null);
exports.ReceivablesController = ReceivablesController = __decorate([
    (0, swagger_1.ApiTags)('receivables'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('receivables'),
    __param(1, (0, common_1.Inject)(azure_blob_service_interface_1.AZURE_BLOB_SERVICE)),
    __metadata("design:paramtypes", [receivables_service_1.ReceivablesService,
        azure_blob_service_1.AzureBlobService])
], ReceivablesController);
//# sourceMappingURL=receivables.controller.js.map