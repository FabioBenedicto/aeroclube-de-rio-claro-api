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
exports.BillsService = void 0;
const common_1 = require("@nestjs/common");
const bill_status_enum_1 = require("./enums/bill-status.enum");
const bills_repository_interface_1 = require("./repository/bills-repository.interface");
let BillsService = class BillsService {
    billsRepository;
    constructor(billsRepository) {
        this.billsRepository = billsRepository;
    }
    findAll(dto) {
        return this.billsRepository.findAll(dto);
    }
    async findOne(id) {
        const bill = await this.billsRepository.findById(id);
        if (!bill)
            throw new common_1.NotFoundException(`Boleto ${id} não encontrado`);
        return bill;
    }
    create(dto) {
        return this.billsRepository.create(dto);
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.billsRepository.update(id, dto);
    }
    async pay(id, dto) {
        const bill = await this.findOne(id);
        if (bill.status !== bill_status_enum_1.EBillStatus.OPEN && bill.status !== bill_status_enum_1.EBillStatus.PENDING_CNAB) {
            throw new common_1.ConflictException(`Não é possível pagar um boleto com status "${bill.status}"`);
        }
        return this.billsRepository.pay(id, {
            status: bill_status_enum_1.EBillStatus.PAID,
            payment_method: dto.payment_method,
            payment_date: dto.payment_date,
            use_credit: dto.use_credit,
        });
    }
    async delete(id) {
        await this.findOne(id);
        return this.billsRepository.delete(id);
    }
    async attachInvoice(id, fileData) {
        await this.findOne(id);
        return this.billsRepository.attachInvoice(id, fileData);
    }
    async deleteInvoice(id) {
        await this.findOne(id);
        return this.billsRepository.deleteInvoice(id);
    }
    bulkDelete(ids) {
        return this.billsRepository.bulkDelete(ids);
    }
};
exports.BillsService = BillsService;
exports.BillsService = BillsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(bills_repository_interface_1.BILLS_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], BillsService);
//# sourceMappingURL=bills.service.js.map