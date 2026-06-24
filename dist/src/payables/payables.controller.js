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
exports.PayablesController = void 0;
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
const create_payable_dto_1 = require("./dto/create-payable.dto");
const create_payable_payment_dto_1 = require("./dto/create-payable-payment.dto");
const find_all_payables_dto_1 = require("./dto/find-all-payables.dto");
const update_payable_dto_1 = require("./dto/update-payable.dto");
const payable_model_1 = require("./model/payable.model");
const payables_service_1 = require("./payables.service");
let PayablesController = class PayablesController {
    payablesService;
    azureBlob;
    constructor(payablesService, azureBlob) {
        this.payablesService = payablesService;
        this.azureBlob = azureBlob;
    }
    findAll(query) {
        return this.payablesService.findAll(query);
    }
    getStats(query) {
        return this.payablesService.getStats(query);
    }
    findOne(id) {
        return this.payablesService.findOne(id);
    }
    create(dto) {
        return this.payablesService.create(dto);
    }
    update(id, dto) {
        return this.payablesService.update(id, dto);
    }
    bulkDelete(dto) {
        return this.payablesService.bulkDelete(dto.ids);
    }
    remove(id) {
        return this.payablesService.remove(id);
    }
    createPayment(id, dto) {
        return this.payablesService.createPayment(id, dto);
    }
    deletePayment(_id, paymentId) {
        return this.payablesService.deletePayment(paymentId);
    }
    async uploadPaymentInvoice(paymentId, file) {
        const payment = await this.payablesService.getPayment(paymentId);
        if (payment.file) {
            await this.azureBlob.delete(payment.file.blob_path);
        }
        const blobPath = this.azureBlob.buildBlobPath('invoices/payable-payments', paymentId, file.originalname);
        const url = await this.azureBlob.upload(blobPath, file.buffer, file.mimetype);
        return this.payablesService.addPaymentInvoice(paymentId, {
            url,
            blob_path: blobPath,
            original_name: file.originalname,
            mime_type: file.mimetype,
            size: file.size,
        });
    }
    async deletePaymentInvoice(paymentId) {
        const payment = await this.payablesService.getPayment(paymentId);
        if (payment.file) {
            await this.azureBlob.delete(payment.file.blob_path);
        }
        await this.payablesService.deletePaymentInvoice(paymentId);
    }
};
exports.PayablesController = PayablesController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.PAYABLES.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'List payables' }),
    (0, swagger_1.ApiResponse)({ type: (0, paginated_response_1.PaginatedResponse)(payable_model_1.Payable) }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_payables_dto_1.FindAllPayablesDto]),
    __metadata("design:returntype", void 0)
], PayablesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.PAYABLES.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get payable stats (total amount and amount paid)' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_payables_dto_1.FindAllPayablesDto]),
    __metadata("design:returntype", void 0)
], PayablesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.PAYABLES.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get payable' }),
    (0, swagger_1.ApiResponse)({ type: payable_model_1.Payable }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PayablesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.PAYABLES.CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Create payable' }),
    (0, swagger_1.ApiResponse)({ type: payable_model_1.Payable }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payable_dto_1.CreatePayableDto]),
    __metadata("design:returntype", void 0)
], PayablesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.PAYABLES.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update payable' }),
    (0, swagger_1.ApiResponse)({ type: payable_model_1.Payable }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_payable_dto_1.UpdatePayableDto]),
    __metadata("design:returntype", void 0)
], PayablesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('bulk'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.PAYABLES.DELETE),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Bulk delete payables' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bulk_delete_dto_1.BulkDeleteDto]),
    __metadata("design:returntype", void 0)
], PayablesController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.PAYABLES.DELETE),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete payable' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PayablesController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/payments'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.PAYABLES.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Register installment payment' }),
    openapi.ApiResponse({ status: 200, type: require("./model/payable.model").Payable }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_payable_payment_dto_1.CreatePayablePaymentDto]),
    __metadata("design:returntype", void 0)
], PayablesController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Delete)(':id/payments/:paymentId'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.PAYABLES.UPDATE),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Reverse payable payment' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('paymentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], PayablesController.prototype, "deletePayment", null);
__decorate([
    (0, common_1.Post)(':id/payments/:paymentId/invoice'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.PAYABLES.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Attach invoice to payment' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    openapi.ApiResponse({ status: 201, type: require("./model/payable-payment.model").PayablePayment }),
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
], PayablesController.prototype, "uploadPaymentInvoice", null);
__decorate([
    (0, common_1.Delete)(':id/payments/:paymentId/invoice'),
    (0, require_permission_decorator_1.RequirePermission)(permissions_1.PERMISSIONS.PAYABLES.UPDATE),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove invoice from payment' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('paymentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PayablesController.prototype, "deletePaymentInvoice", null);
exports.PayablesController = PayablesController = __decorate([
    (0, swagger_1.ApiTags)('payables'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('payables'),
    __param(1, (0, common_1.Inject)(azure_blob_service_interface_1.AZURE_BLOB_SERVICE)),
    __metadata("design:paramtypes", [payables_service_1.PayablesService,
        azure_blob_service_1.AzureBlobService])
], PayablesController);
//# sourceMappingURL=payables.controller.js.map