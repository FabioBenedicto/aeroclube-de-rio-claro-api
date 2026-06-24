"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRemessaLines = buildRemessaLines;
const cnab_utils_1 = require("../utils/cnab.utils");
function buildFileHeader(s, now) {
    const linha = '756' +
        '0000' +
        '0' +
        ' '.repeat(9) +
        '2' +
        (0, cnab_utils_1.numericPad)(s.cnpj, 14) +
        ' '.repeat(20) +
        (0, cnab_utils_1.numericPad)(s.cooperative_prefix, 5) +
        (0, cnab_utils_1.alphaPad)(s.cooperative_digit, 1) +
        (0, cnab_utils_1.numericPad)(s.account, 12) +
        (0, cnab_utils_1.numericPad)(s.account_digit, 1) +
        '0' +
        (0, cnab_utils_1.alphaPad)(s.company_name, 30) +
        (0, cnab_utils_1.alphaPad)('SICOOB', 30) +
        ' '.repeat(10) +
        '1' +
        (0, cnab_utils_1.formatDate)(now) +
        (0, cnab_utils_1.formatTime)(now) +
        (0, cnab_utils_1.numericPad)(s.remittance_sequence, 6) +
        '081' +
        '00000' +
        ' '.repeat(20) +
        ' '.repeat(20) +
        ' '.repeat(29);
    if (linha.length !== 240) {
        throw new Error(`CNAB File Header has ${linha.length} characters (expected 240)`);
    }
    return linha;
}
function buildBatchHeader(s, now, lote) {
    const linha = '756' +
        (0, cnab_utils_1.numericPad)(lote, 4) +
        '1' +
        'R' +
        '01' +
        '  ' +
        '040' +
        ' ' +
        '2' +
        (0, cnab_utils_1.numericPad)(s.cnpj, 15) +
        ' '.repeat(20) +
        (0, cnab_utils_1.numericPad)(s.cooperative_prefix, 5) +
        (0, cnab_utils_1.alphaPad)(s.cooperative_digit, 1) +
        (0, cnab_utils_1.numericPad)(s.account, 12) +
        (0, cnab_utils_1.numericPad)(s.account_digit, 1) +
        ' ' +
        (0, cnab_utils_1.alphaPad)(s.company_name, 30) +
        ' '.repeat(40) +
        ' '.repeat(40) +
        (0, cnab_utils_1.numericPad)(s.remittance_sequence, 8) +
        (0, cnab_utils_1.formatDate)(now) +
        '00000000' +
        ' '.repeat(33);
    if (linha.length !== 240) {
        throw new Error(`CNAB Batch Header has ${linha.length} characters (expected 240)`);
    }
    return linha;
}
function buildSegmentoP(s, bill, seq, lote) {
    const ourNumber = '0000000000' +
        '01' +
        (0, cnab_utils_1.numericPad)(s.modality, 2) +
        '4' +
        '     ';
    const linha = '756' +
        (0, cnab_utils_1.numericPad)(lote, 4) +
        '3' +
        (0, cnab_utils_1.numericPad)(seq, 5) +
        'P' +
        ' ' +
        '01' +
        (0, cnab_utils_1.numericPad)(s.cooperative_prefix, 5) +
        (0, cnab_utils_1.alphaPad)(s.cooperative_digit, 1) +
        (0, cnab_utils_1.numericPad)(s.account, 12) +
        (0, cnab_utils_1.numericPad)(s.account_digit, 1) +
        ' ' +
        ourNumber +
        (0, cnab_utils_1.numericPad)(s.wallet, 1) +
        '0' +
        ' ' +
        '1' +
        '2' +
        (0, cnab_utils_1.numericPad)(bill.id, 15) +
        (0, cnab_utils_1.formatDate)(bill.expiration_date) +
        (0, cnab_utils_1.formatValue)(bill.total_amount, 15) +
        '00000' +
        ' ' +
        '04' +
        'N' +
        (0, cnab_utils_1.formatDate)(bill.created_at ?? bill.expiration_date) +
        (s.interest_rate > 0 ? s.interest_type : '0') +
        (() => {
            if (s.interest_rate <= 0)
                return '00000000';
            const d = new Date(bill.expiration_date);
            d.setUTCDate(d.getUTCDate() + Math.max(s.interest_period, 1));
            return (0, cnab_utils_1.formatDate)(d);
        })() +
        (0, cnab_utils_1.formatValue)(s.interest_rate, 15) +
        '0' +
        '00000000' +
        '000000000000000' +
        '000000000000000' +
        '000000000000000' +
        (0, cnab_utils_1.alphaPad)(String(bill.id), 25) +
        '3' +
        '00' +
        '0' +
        '   ' +
        '09' +
        '0000000000' +
        ' ';
    if (linha.length !== 240) {
        throw new Error(`CNAB Segment P seq ${seq} has ${linha.length} characters (expected 240)`);
    }
    return linha;
}
function buildSegmentoQ(bill, seq, lote) {
    const zip = (bill.people.address?.zip_code ?? '')
        .replace(/\D/g, '')
        .padEnd(8, '0');
    const cep1 = zip.substring(0, 5);
    const cep2 = zip.substring(5, 8);
    const linha = '756' +
        (0, cnab_utils_1.numericPad)(lote, 4) +
        '3' +
        (0, cnab_utils_1.numericPad)(seq, 5) +
        'Q' +
        ' ' +
        '01' +
        '1' +
        (0, cnab_utils_1.formatCpf)(bill.people.cpf) +
        (0, cnab_utils_1.alphaPad)(bill.people.name, 40) +
        (0, cnab_utils_1.alphaPad)(bill.people.address?.street, 40) +
        (0, cnab_utils_1.alphaPad)(bill.people.address?.neighborhood, 15) +
        (0, cnab_utils_1.numericPad)(cep1, 5) +
        (0, cnab_utils_1.numericPad)(cep2, 3) +
        (0, cnab_utils_1.alphaPad)(bill.people.address?.city, 15) +
        (0, cnab_utils_1.alphaPad)(bill.people.address?.state, 2) +
        '0' +
        '000000000000000' +
        ' '.repeat(40) +
        '000' +
        ' '.repeat(20) +
        ' '.repeat(8);
    if (linha.length !== 240) {
        throw new Error(`CNAB Segment Q seq ${seq} has ${linha.length} characters (expected 240)`);
    }
    return linha;
}
function buildBatchTrailer(lote, totalRecords, billCount, totalValue) {
    const linha = '756' +
        (0, cnab_utils_1.numericPad)(lote, 4) +
        '5' +
        ' '.repeat(9) +
        (0, cnab_utils_1.numericPad)(totalRecords, 6) +
        (0, cnab_utils_1.numericPad)(billCount, 6) +
        (0, cnab_utils_1.formatValue)(totalValue, 17) +
        (0, cnab_utils_1.numericPad)(0, 6) +
        (0, cnab_utils_1.formatValue)(0, 17) +
        (0, cnab_utils_1.numericPad)(0, 6) +
        (0, cnab_utils_1.formatValue)(0, 17) +
        (0, cnab_utils_1.numericPad)(0, 6) +
        (0, cnab_utils_1.formatValue)(0, 17) +
        ' '.repeat(8) +
        ' '.repeat(117);
    if (linha.length !== 240) {
        throw new Error(`CNAB Batch Trailer has ${linha.length} characters (expected 240)`);
    }
    return linha;
}
function buildFileTrailer(totalLotes, totalRecords) {
    const linha = '756' +
        '9999' +
        '9' +
        ' '.repeat(9) +
        (0, cnab_utils_1.numericPad)(totalLotes, 6) +
        (0, cnab_utils_1.numericPad)(totalRecords, 6) +
        '000000' +
        ' '.repeat(205);
    if (linha.length !== 240) {
        throw new Error(`CNAB File Trailer has ${linha.length} characters (expected 240)`);
    }
    return linha;
}
function buildRemessaLines(settings, bills, generationDate = new Date()) {
    const lote = 1;
    const lines = [];
    lines.push(buildFileHeader(settings, generationDate));
    lines.push(buildBatchHeader(settings, generationDate, lote));
    let seqInLote = 1;
    let totalValue = 0;
    for (const bill of bills) {
        lines.push(buildSegmentoP(settings, bill, seqInLote++, lote));
        lines.push(buildSegmentoQ(bill, seqInLote++, lote));
        totalValue += parseFloat(String(bill.total_amount));
    }
    const totalRecordsInLote = 1 + bills.length * 2 + 1;
    lines.push(buildBatchTrailer(lote, totalRecordsInLote, bills.length, totalValue));
    const totalRecordsInFile = lines.length + 1;
    lines.push(buildFileTrailer(1, totalRecordsInFile));
    return lines;
}
//# sourceMappingURL=remittent.builder.js.map