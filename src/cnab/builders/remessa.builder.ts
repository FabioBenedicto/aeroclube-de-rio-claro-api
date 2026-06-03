import { numericPad, alphaPad, formatDate, formatTime, formatValue, formatCpf, assertLine240 } from '../utils/cnab.formatter';

type SicoobSettings = {
  sicoob_cooperativa_prefix: string;
  sicoob_cooperativa_dv: string;
  sicoob_conta: string;
  sicoob_conta_dv: string;
  sicoob_carteira: string;
  sicoob_modalidade: string;
  sicoob_cnpj: string;
  sicoob_nome_empresa: string;
  sicoob_remessa_sequence: number;
  sicoob_juros: number;
  sicoob_juros_prazo: number;
  sicoob_juros_tipo: string;
};

type BillWithCustomer = {
  id: number;
  total_amount: { toString(): string };
  due_date: Date;
  issue_date: Date;
  customer: {
    cpf: string;
    name: string;
    address?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
  };
};

function buildFileHeader(s: SicoobSettings, now: Date): string {
  const linha =
    '756' +                                  // 001-003 banco
    '0000' +                                 // 004-007 lote
    '0' +                                    // 008 record type
    ' '.repeat(9) +                          // 009-017 CNAB
    '2' +                                    // 018 registration type (CNPJ)
    numericPad(s.sicoob_cnpj, 14) +          // 019-032 CNPJ
    ' '.repeat(20) +                         // 033-052 agreement
    numericPad(s.sicoob_cooperativa_prefix, 5) + // 053-057 cooperative prefix
    alphaPad(s.sicoob_cooperativa_dv, 1) +   // 058 prefix DV
    numericPad(s.sicoob_conta, 12) +         // 059-070 account
    numericPad(s.sicoob_conta_dv, 1) +       // 071 account DV
    '0' +                                    // 072 branch/account DV
    alphaPad(s.sicoob_nome_empresa, 30) +    // 073-102 company name
    alphaPad('SICOOB', 30) +                 // 103-132 nome banco
    ' '.repeat(10) +                         // 133-142 CNAB
    '1' +                                    // 143 remessa code
    formatDate(now) +                        // 144-151 generation date
    formatTime(now) +                        // 152-157 generation time
    numericPad(s.sicoob_remessa_sequence, 6) + // 158-163 NSA
    '081' +                                  // 164-166 layout version
    '00000' +                                // 167-171 density
    ' '.repeat(20) +                         // 172-191 reservado banco
    ' '.repeat(20) +                         // 192-211 reservado empresa
    ' '.repeat(29);                          // 212-240 CNAB
  assertLine240(linha, 0);
  return linha;
}

function buildBatchHeader(s: SicoobSettings, now: Date, lote: number): string {
  const linha =
    '756' +                                  // 001-003 banco
    numericPad(lote, 4) +                    // 004-007 lote
    '1' +                                    // 008 record type
    'R' +                                    // 009 remessa operation
    '01' +                                   // 010-011 billing service
    '  ' +                                   // 012-013 CNAB
    '040' +                                  // 014-016 batch layout version
    ' ' +                                    // 017 CNAB
    '2' +                                    // 018 registration type (CNPJ)
    numericPad(s.sicoob_cnpj, 15) +          // 019-033 CNPJ 15 digits
    ' '.repeat(20) +                         // 034-053 agreement
    numericPad(s.sicoob_cooperativa_prefix, 5) + // 054-058 cooperative prefix
    alphaPad(s.sicoob_cooperativa_dv, 1) +   // 059 prefix DV
    numericPad(s.sicoob_conta, 12) +         // 060-071 account
    numericPad(s.sicoob_conta_dv, 1) +       // 072 account DV
    ' ' +                                    // 073 branch/account DV
    alphaPad(s.sicoob_nome_empresa, 30) +    // 074-103 company name
    ' '.repeat(40) +                         // 104-143 message 1
    ' '.repeat(40) +                         // 144-183 message 2
    numericPad(s.sicoob_remessa_sequence, 8) + // 184-191 remessa NSA
    formatDate(now) +                        // 192-199 recording date
    '00000000' +                             // 200-207 credit date
    ' '.repeat(33);                          // 208-240 CNAB
  assertLine240(linha, 1);
  return linha;
}

function buildSegmentoP(s: SicoobSettings, bill: BillWithCustomer, seq: number, lote: number): string {
  const nossoNumero =
    '0000000000' +                           // 10 zeros (Sicoob emite)
    '01' +                                   // single installment
    numericPad(s.sicoob_modalidade, 2) +     // modality
    '4' +                                    // form type A4
    '     ';                                 // 5 spaces

  const linha =
    '756' +                                  // 001-003 banco
    numericPad(lote, 4) +                    // 004-007 lote
    '3' +                                    // 008 tipo registro
    numericPad(seq, 5) +                     // 009-013 seq record number
    'P' +                                    // 014 segment
    ' ' +                                    // 015 CNAB
    '01' +                                   // 016-017 entry movement code
    numericPad(s.sicoob_cooperativa_prefix, 5) +  // 018-022 maintaining branch (= cooperative prefix)
    alphaPad(s.sicoob_cooperativa_dv, 1) +   // 023 prefix DV
    numericPad(s.sicoob_conta, 12) +         // 024-035 account
    numericPad(s.sicoob_conta_dv, 1) +       // 036 account DV
    ' ' +                                    // 037 branch/account DV
    nossoNumero +                            // 038-057 our number (20 chars)
    numericPad(s.sicoob_carteira, 1) +       // 058 portfolio
    '0' +                                    // 059 registration
    ' ' +                                    // 060 document type
    '1' +                                    // 061 Sicoob issuance
    '2' +                                    // 062 distribution by company
    numericPad(bill.id, 15) +                // 063-077 document number = bill.id
    formatDate(bill.due_date) +              // 078-085 due date
    formatValue(bill.total_amount, 15) +     // 086-100 nominal value (13+2)
    '00000' +                                // 101-105 collecting branch
    ' ' +                                    // 106 collecting branch DV
    '04' +                                   // 107-108 species DS
    'N' +                                    // 109 acceptance — not accepted
    formatDate(bill.issue_date) +            // 110-117 issue date
    (s.sicoob_juros > 0 ? s.sicoob_juros_tipo : '0') + // 118 interest code (0=exempt, 1=value/day, 2=monthly rate)
    (() => {
      if (s.sicoob_juros <= 0) return '00000000';
      const d = new Date(bill.due_date);
      d.setUTCDate(d.getUTCDate() + Math.max(s.sicoob_juros_prazo, 1));
      return formatDate(d);
    })() +                                   // 119-126 interest start date (required when code != 0)
    formatValue(s.sicoob_juros, 15) +        // 127-141 monthly interest rate % (15 chars = 13+2 decimals)
    '0' +                                    // 142 discount code 1
    '00000000' +                             // 143-150 discount date 1
    '000000000000000' +                      // 151-165 discount 1 (15 chars)
    '000000000000000' +                      // 166-180 IOF (15 chars)
    '000000000000000' +                      // 181-195 rebate (15 chars)
    alphaPad(String(bill.id), 25) +          // 196-220 company use
    '3' +                                    // 221 do not protest
    '00' +                                   // 222-223 protest deadline
    '0' +                                    // 224 write-off code
    '   ' +                                  // 225-227 write-off deadline
    '09' +                                   // 228-229 currency code BRL
    '0000000000' +                           // 230-239 contract number
    ' ';                                     // 240 CNAB
  assertLine240(linha, seq);
  return linha;
}

function buildSegmentoQ(bill: BillWithCustomer, seq: number, lote: number): string {
  const zip = (bill.customer.zip_code ?? '00000000').replace(/\D/g, '').padEnd(8, '0');
  const cep1 = zip.substring(0, 5);
  const cep2 = zip.substring(5, 8);

  const linha =
    '756' +                                  // 001-003 banco
    numericPad(lote, 4) +                    // 004-007 lote
    '3' +                                    // 008 record type
    numericPad(seq, 5) +                     // 009-013 seq record number
    'Q' +                                    // 014 segment
    ' ' +                                    // 015 CNAB
    '01' +                                   // 016-017 movement code
    '1' +                                    // 018 registration type CPF
    formatCpf(bill.customer.cpf) +           // 019-033 CPF (15 chars)
    alphaPad(bill.customer.name, 40) +       // 034-073 name (40 chars)
    alphaPad(bill.customer.address, 40) +    // 074-113 address (40 chars)
    alphaPad(bill.customer.neighborhood, 15) + // 114-128 neighborhood (15 chars)
    numericPad(cep1, 5) +                    // 129-133 ZIP code part 1
    numericPad(cep2, 3) +                    // 134-136 ZIP code suffix
    alphaPad(bill.customer.city, 15) +       // 137-151 city (15 chars)
    alphaPad(bill.customer.state, 2) +       // 152-153 state
    '0' +                                    // 154 guarantor exempt
    '000000000000000' +                      // 155-169 guarantor registration
    ' '.repeat(40) +                         // 170-209 guarantor name
    '000' +                                  // 210-212 correspondent bank code
    ' '.repeat(20) +                         // 213-232 correspondent bank our number
    ' '.repeat(8);                           // 233-240 CNAB
  assertLine240(linha, seq);
  return linha;
}

function buildBatchTrailer(lote: number, totalRecords: number, billCount: number, totalValue: number): string {
  const linha =
    '756' +                                  // 001-003 banco
    numericPad(lote, 4) +                    // 004-007 lote
    '5' +                                    // 008 record type
    ' '.repeat(9) +                          // 009-017 CNAB
    numericPad(totalRecords, 6) +            // 018-023 batch record count
    numericPad(billCount, 6) +               // 024-029 simple bill count
    formatValue(totalValue, 17) +            // 030-046 total value (15+2=17)
    numericPad(0, 6) +                       // 047-052 linked count
    formatValue(0, 17) +                     // 053-069 linked value
    numericPad(0, 6) +                       // 070-075 pledged count
    formatValue(0, 17) +                     // 076-092 pledged value
    numericPad(0, 6) +                       // 093-098 discounted count
    formatValue(0, 17) +                     // 099-115 discounted value
    ' '.repeat(8) +                          // 116-123 notice number
    ' '.repeat(117);                         // 124-240 CNAB
  assertLine240(linha, -1);
  return linha;
}

function buildFileTrailer(totalLotes: number, totalRecords: number): string {
  const linha =
    '756' +                                  // 001-003 banco
    '9999' +                                 // 004-007 lote
    '9' +                                    // 008 record type
    ' '.repeat(9) +                          // 009-017 CNAB
    numericPad(totalLotes, 6) +              // 018-023 batch count
    numericPad(totalRecords, 6) +            // 024-029 total record count
    '000000' +                               // 030-035 reconciliation account count
    ' '.repeat(205);                         // 036-240 CNAB
  assertLine240(linha, -2);
  return linha;
}

export function buildRemessaLines(
  settings: SicoobSettings,
  bills: BillWithCustomer[],
  generationDate: Date = new Date(),
): string[] {
  const lote = 1;
  const lines: string[] = [];

  lines.push(buildFileHeader(settings, generationDate));
  lines.push(buildBatchHeader(settings, generationDate, lote));

  let seqInLote = 1;
  let totalValue = 0;

  for (const bill of bills) {
    lines.push(buildSegmentoP(settings, bill, seqInLote++, lote));
    lines.push(buildSegmentoQ(bill, seqInLote++, lote));
    totalValue += parseFloat(String(bill.total_amount));
  }

  // totalRecords in lote = batchHeader + segments + batchTrailer
  const totalRecordsInLote = 1 + bills.length * 2 + 1;
  lines.push(buildBatchTrailer(lote, totalRecordsInLote, bills.length, totalValue));

  const totalRecordsInFile = lines.length + 1; // +1 for file trailer itself
  lines.push(buildFileTrailer(1, totalRecordsInFile));

  return lines;
}
