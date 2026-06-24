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
exports.CnabService = void 0;
const common_1 = require("@nestjs/common");
const iconv = require("iconv-lite");
const bills_repository_interface_1 = require("../bills/repository/bills-repository.interface");
const azure_blob_service_interface_1 = require("../common/providers/azure-blob/azure-blob.service.interface");
const sicoob_settings_repository_interface_1 = require("../settings/repository/sicoob/sicoob-settings-repository.interface");
const remittent_builder_1 = require("./builders/remittent.builder");
const cnab_repository_interface_1 = require("./repository/cnab-repository.interface");
let CnabService = class CnabService {
    CnabRepository;
    billsRepository;
    sicoobSettingsRepository;
    azureBlobService;
    constructor(CnabRepository, billsRepository, sicoobSettingsRepository, azureBlobService) {
        this.CnabRepository = CnabRepository;
        this.billsRepository = billsRepository;
        this.sicoobSettingsRepository = sicoobSettingsRepository;
        this.azureBlobService = azureBlobService;
    }
    listRemittent(page, limit) {
        return this.CnabRepository.listRemittent(page, limit);
    }
    async generateRemittent(dto) {
        const config = await this.sicoobSettingsRepository.find();
        if (!config ||
            !config.cooperative_prefix ||
            !config.cooperative_digit ||
            !config.account ||
            !config.account_digit ||
            !config.cnpj ||
            !config.wallet ||
            !config.modality ||
            !config.company_name) {
            throw new common_1.UnprocessableEntityException('Configurações do Sicoob incompletas.');
        }
        const bills = await this.billsRepository.findByIds(dto.bill_ids);
        const missing = dto.bill_ids.filter((id) => !bills.find((b) => b.id === id));
        if (missing.length > 0) {
            throw new common_1.NotFoundException(`Boletos não encontrados: ${missing.join(', ')}`);
        }
        const withoutAddress = bills.filter((b) => !b.people?.address);
        if (withoutAddress.length > 0) {
            const names = withoutAddress
                .map((b) => b.people?.name ?? `Boleto ${b.id}`)
                .join(', ');
            throw new common_1.UnprocessableEntityException(`Os seguintes clientes não possuem endereço cadastrado: ${names}`);
        }
        const sequenceNumber = config.remittance_sequence;
        const now = new Date();
        const lines = (0, remittent_builder_1.buildRemessaLines)({
            cooperative_prefix: config.cooperative_prefix,
            cooperative_digit: config.cooperative_digit,
            account: config.account,
            account_digit: config.account_digit,
            wallet: config.wallet,
            modality: config.modality,
            cnpj: config.cnpj,
            company_name: config.company_name,
            remittance_sequence: config.remittance_sequence,
            interest_rate: config.interest_rate,
            interest_period: config.interest_period,
            interest_type: config.interest_type,
        }, bills, now);
        const content = lines.join('\r\n') + '\r\n';
        const buffer = iconv.encode(content, 'win1252');
        const dd = String(now.getUTCDate()).padStart(2, '0');
        const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
        const yyyy = String(now.getUTCFullYear());
        const filename = `remessa_${yyyy}${mm}${dd}_${sequenceNumber}.rem`;
        const blobPath = `cnab/${filename}`;
        const url = await this.azureBlobService.upload(blobPath, buffer, 'application/octet-stream');
        await this.sicoobSettingsRepository.incrementRemittanceSequence();
        await this.billsRepository.markPendingCnab(dto.bill_ids);
        const totalAmount = bills.reduce((s, b) => s + parseFloat(String(b.total_amount)), 0);
        return this.CnabRepository.createRemittent({
            sequence_number: sequenceNumber,
            bill_count: dto.bill_ids.length,
            total_amount: totalAmount,
            file: {
                url,
                blob_path: blobPath,
                original_name: filename,
                mime_type: 'application/octet-stream',
                size: buffer.byteLength,
            },
            bill_ids: dto.bill_ids,
        });
    }
    async getRemittentDetail(id) {
        const remittent = await this.CnabRepository.findRemittent(id);
        if (!remittent)
            throw new common_1.NotFoundException(`Remessa ${id} não encontrada`);
        const bills = await this.billsRepository.findByIds(remittent.bill_ids);
        return { ...remittent, bills };
    }
    async downloadRemessa(id) {
        const remittent = await this.CnabRepository.findRemittent(id);
        if (!remittent)
            throw new common_1.NotFoundException(`Remessa ${id} não encontrada`);
        const buffer = await this.azureBlobService
            .download(remittent.file.blob_path)
            .catch(() => {
            throw new common_1.NotFoundException('Arquivo de remessa não encontrado no storage');
        });
        return {
            buffer,
            filename: remittent.file.original_name,
        };
    }
    async deleteRemittent(id) {
        const remittent = await this.CnabRepository.findRemittent(id);
        if (!remittent)
            throw new common_1.NotFoundException(`Remessa ${id} não encontrada`);
        await this.azureBlobService.delete(remittent.file.blob_path);
        await this.billsRepository.revertFromPendingCnab(remittent.bill_ids);
        await this.CnabRepository.deleteRemessa(id);
        return remittent;
    }
};
exports.CnabService = CnabService;
exports.CnabService = CnabService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cnab_repository_interface_1.CNAB_REPOSITORY)),
    __param(1, (0, common_1.Inject)(bills_repository_interface_1.BILLS_REPOSITORY)),
    __param(2, (0, common_1.Inject)(sicoob_settings_repository_interface_1.SICOOB_SETTINGS_REPOSITORY)),
    __param(3, (0, common_1.Inject)(azure_blob_service_interface_1.AZURE_BLOB_SERVICE)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], CnabService);
//# sourceMappingURL=cnab.service.js.map