import {
  alphaPad,
  formatCpf,
  formatDate,
  formatTime,
  formatValue,
  numericPad,
} from '../utils/cnab.utils';

interface SicoobSettings {
  cooperative_prefix: string;
  cooperative_digit: string;
  account: string;
  account_digit: string;
  wallet: string;
  modality: string;
  cnpj: string;
  company_name: string;
  remittance_sequence: number;
  interest_rate: number;
  interest_period: number;
  interest_type: string;
}

export type BillWithCustomer = {
  id: number;
  total_amount: { toString(): string };
  expiration_date: Date;
  created_at?: Date;
  payment_date?: Date | null;
  status?: string;
  people: {
    cpf: string;
    name: string;
    address?: {
      street?: string | null;
      neighborhood?: string | null;
      city?: string | null;
      state?: string | null;
      zip_code?: string | null;
    } | null;
  };
};

function buildFileHeader(s: SicoobSettings, now: Date): string {
  const linha =
    '756' + // [001-003] (003) Bank Code (Sicoob)
    '0000' + // [004-007] (004) Service Batch (0000 = Master File)
    '0' + // [008-008] (001) Record Type (0 = File Header)
    ' '.repeat(9) + // [009-017] (009) CNAB / FEBRABAN Reserved (Blanks)
    '2' + // [018-018] (001) Company Inscription Type (2 = CNPJ)
    numericPad(s.cnpj, 14) + // [019-032] (014) Company Inscription Number (CNPJ)
    ' '.repeat(20) + // [033-052] (020) Bank Agreement Number
    numericPad(s.cooperative_prefix, 5) + // [053-057] (005) Maintaining Branch (Cooperative)
    alphaPad(s.cooperative_digit, 1) + // [058-058] (001) Branch Check Digit (DV)
    numericPad(s.account, 12) + // [059-070] (012) Account Number
    numericPad(s.account_digit, 1) + // [071-071] (001) Account Check Digit (DV)
    '0' + // [072-072] (001) Branch/Account Check Digit (DV)
    alphaPad(s.company_name, 30) + // [073-102] (030) Company Name
    alphaPad('SICOOB', 30) + // [103-132] (030) Bank Name
    ' '.repeat(10) + // [133-142] (010) CNAB / FEBRABAN Reserved (Blanks)
    '1' + // [143-143] (001) File Code (1 = Remittance)
    formatDate(now) + // [144-151] (008) File Generation Date
    formatTime(now) + // [152-157] (006) File Generation Time
    numericPad(s.remittance_sequence, 6) + // [158-163] (006) Remittance Sequential Number (NSA)
    '081' + // [164-166] (003) File Layout Version (081)
    '00000' + // [167-171] (005) Recording Density
    ' '.repeat(20) + // [172-191] (020) Bank Reserved (Blanks)
    ' '.repeat(20) + // [192-211] (020) Company Reserved (Blanks)
    ' '.repeat(29); // [212-240] (029) CNAB / FEBRABAN Reserved (Blanks)

  if (linha.length !== 240) {
    throw new Error(
      `CNAB File Header has ${linha.length} characters (expected 240)`,
    );
  }

  return linha;
}

function buildBatchHeader(s: SicoobSettings, now: Date, lote: number): string {
  const linha =
    '756' + // [001-003] (003) Bank Code (Sicoob)
    numericPad(lote, 4) + // [004-007] (004) Service Batch Number
    '1' + // [008-008] (001) Record Type (1 = Batch Header)
    'R' + // [009-009] (001) Operation Type (R = Remittance)
    '01' + // [010-011] (002) Service Type (01 = Billing/Collection)
    '  ' + // [012-013] (002) CNAB / FEBRABAN Reserved (Blanks)
    '040' + // [014-016] (003) Batch Layout Version (040)
    ' ' + // [017-017] (001) CNAB / FEBRABAN Reserved (Blanks)
    '2' + // [018-018] (001) Company Inscription Type (2 = CNPJ)
    numericPad(s.cnpj, 15) + // [019-033] (015) Company Inscription Number (CNPJ)
    ' '.repeat(20) + // [034-053] (020) Bank Agreement Number
    numericPad(s.cooperative_prefix, 5) + // [054-058] (005) Maintaining Branch (Cooperative)
    alphaPad(s.cooperative_digit, 1) + // [059-059] (001) Branch Check Digit (DV)
    numericPad(s.account, 12) + // [060-071] (012) Account Number
    numericPad(s.account_digit, 1) + // [072-072] (001) Account Check Digit (DV)
    ' ' + // [073-073] (001) Branch/Account Check Digit (DV)
    alphaPad(s.company_name, 30) + // [074-103] (030) Company Name
    ' '.repeat(40) + // [104-143] (040) Message 1
    ' '.repeat(40) + // [144-183] (040) Message 2
    numericPad(s.remittance_sequence, 8) + // [184-191] (008) Remittance Sequential Number (NSA)
    formatDate(now) + // [192-199] (008) File Generation Date
    '00000000' + // [200-207] (008) Credit Date (Blank/Zeros for Remittance)
    ' '.repeat(33); // [208-240] (033) CNAB / FEBRABAN Reserved (Blanks)

  if (linha.length !== 240) {
    throw new Error(
      `CNAB Batch Header has ${linha.length} characters (expected 240)`,
    );
  }

  return linha;
}

function buildSegmentoP(
  s: SicoobSettings,
  bill: BillWithCustomer,
  seq: number,
  lote: number,
): string {
  const ourNumber =
    '0000000000' + // 10 zeros (Issued by Sicoob)
    '01' + // Single installment
    numericPad(s.modality, 2) + // Modality
    '4' + // Form type A4
    '     '; // 5 spaces (Blanks)

  const linha =
    '756' + // [001-003] (003) Bank Code (Sicoob)
    numericPad(lote, 4) + // [004-007] (004) Service Batch Number
    '3' + // [008-008] (001) Record Type (3 = Detail)
    numericPad(seq, 5) + // [009-013] (005) Sequential Record Number
    'P' + // [014-014] (001) Segment Code (P)
    ' ' + // [015-015] (001) CNAB / FEBRABAN Reserved (Blanks)
    '01' + // [016-017] (002) Movement Code (01 = Entry)
    numericPad(s.cooperative_prefix, 5) + // [018-022] (005) Maintaining Branch (Cooperative)
    alphaPad(s.cooperative_digit, 1) + // [023-023] (001) Branch Check Digit (DV)
    numericPad(s.account, 12) + // [024-035] (012) Account Number
    numericPad(s.account_digit, 1) + // [036-036] (001) Account Check Digit (DV)
    ' ' + // [037-037] (001) Branch/Account Check Digit (DV)
    ourNumber + // [038-057] (020) 'Our Number' Identification
    numericPad(s.wallet, 1) + // [058-058] (001) Portfolio / Wallet Code
    '0' + // [059-059] (001) Registration Form Type
    ' ' + // [060-060] (001) Document Type (Blank for Sicoob)
    '1' + // [061-061] (001) Issuance Responsibility (1 = Sicoob)
    '2' + // [062-062] (001) Distribution Responsibility (2 = Company)
    numericPad(bill.id, 15) + // [063-077] (015) Document Number / Bill ID
    formatDate(bill.expiration_date) + // [078-085] (008) Due / Expiration Date
    formatValue(bill.total_amount, 15) + // [086-100] (015) Nominal Value
    '00000' + // [101-105] (005) Collecting Branch
    ' ' + // [106-106] (001) Collecting Branch Check Digit (DV)
    '04' + // [107-108] (002) Document Species (04 = DS)
    'N' + // [109-109] (001) Acceptance (N = Not Accepted)
    formatDate(bill.created_at ?? bill.expiration_date) + // [110-117] (008) Issue Date
    (s.interest_rate > 0 ? s.interest_type : '0') + // [118-118] (001) Interest Code (0=exempt, 1=val/day, 2=rate/month)
    (() => {
      if (s.interest_rate <= 0) return '00000000';
      const d = new Date(bill.expiration_date);
      d.setUTCDate(d.getUTCDate() + Math.max(s.interest_period, 1));
      return formatDate(d);
    })() + // [119-126] (008) Interest Start Date
    formatValue(s.interest_rate, 15) + // [127-141] (015) Interest Rate / Value
    '0' + // [142-142] (001) Discount Code 1
    '00000000' + // [143-150] (008) Discount Date 1
    '000000000000000' + // [151-165] (015) Discount Value / Percentage 1
    '000000000000000' + // [166-180] (015) IOF Value
    '000000000000000' + // [181-195] (015) Abatement / Rebate Value
    alphaPad(String(bill.id), 25) + // [196-220] (025) Company Use / Free Text
    '3' + // [221-221] (001) Protest Code (3 = Do Not Protest)
    '00' + // [222-223] (002) Protest Deadline (Days)
    '0' + // [224-224] (001) Write-off / Return Code
    '   ' + // [225-227] (003) Write-off Deadline (Days)
    '09' + // [228-229] (002) Currency Code (09 = BRL)
    '0000000000' + // [230-239] (010) Credit Operation Contract Number
    ' '; // [240-240] (001) CNAB / FEBRABAN Reserved (Blanks)

  if (linha.length !== 240) {
    throw new Error(
      `CNAB Segment P seq ${seq} has ${linha.length} characters (expected 240)`,
    );
  }

  return linha;
}

function buildSegmentoQ(
  bill: BillWithCustomer,
  seq: number,
  lote: number,
): string {
  const zip = (bill.people.address?.zip_code ?? '')
    .replace(/\D/g, '')
    .padEnd(8, '0');
  const cep1 = zip.substring(0, 5);
  const cep2 = zip.substring(5, 8);

  const linha =
    '756' + // [001-003] (003) Bank Code (Sicoob)
    numericPad(lote, 4) + // [004-007] (004) Service Batch Number
    '3' + // [008-008] (001) Record Type (3 = Detail)
    numericPad(seq, 5) + // [009-013] (005) Sequential Record Number
    'Q' + // [014-014] (001) Segment Code (Q)
    ' ' + // [015-015] (001) CNAB / FEBRABAN Reserved (Blanks)
    '01' + // [016-017] (002) Movement Code (01 = Entry)
    '1' + // [018-018] (001) Payer Inscription Type (1 = CPF)
    formatCpf(bill.people.cpf) + // [019-033] (015) Payer Inscription Number (CPF)
    alphaPad(bill.people.name, 40) + // [034-073] (040) Payer Name
    alphaPad(bill.people.address?.street, 40) + // [074-113] (040) Payer Address
    alphaPad(bill.people.address?.neighborhood, 15) + // [114-128] (015) Payer Neighborhood
    numericPad(cep1, 5) + // [129-133] (005) Payer Zip Code (Prefix)
    numericPad(cep2, 3) + // [134-136] (003) Payer Zip Code (Suffix)
    alphaPad(bill.people.address?.city, 15) + // [137-151] (015) Payer City
    alphaPad(bill.people.address?.state, 2) + // [152-153] (002) Payer State / Province
    '0' + // [154-154] (001) Guarantor Inscription Type (0 = Exempt)
    '000000000000000' + // [155-169] (015) Guarantor Inscription Number
    ' '.repeat(40) + // [170-209] (040) Guarantor Name
    '000' + // [210-212] (003) Correspondent Bank Code
    ' '.repeat(20) + // [213-232] (020) Correspondent Bank 'Our Number'
    ' '.repeat(8); // [233-240] (008) CNAB / FEBRABAN Reserved (Blanks)

  if (linha.length !== 240) {
    throw new Error(
      `CNAB Segment Q seq ${seq} has ${linha.length} characters (expected 240)`,
    );
  }

  return linha;
}

function buildBatchTrailer(
  lote: number,
  totalRecords: number,
  billCount: number,
  totalValue: number,
): string {
  const linha =
    '756' + // [001-003] (003) Bank Code (Sicoob)
    numericPad(lote, 4) + // [004-007] (004) Service Batch Number
    '5' + // [008-008] (001) Record Type (5 = Batch Trailer)
    ' '.repeat(9) + // [009-017] (009) CNAB / FEBRABAN Reserved (Blanks)
    numericPad(totalRecords, 6) + // [018-023] (006) Batch Records Count
    numericPad(billCount, 6) + // [024-029] (006) Simple Collection: Bills Count
    formatValue(totalValue, 17) + // [030-046] (017) Simple Collection: Total Value
    numericPad(0, 6) + // [047-052] (006) Linked Collection Bills Count
    formatValue(0, 17) + // [053-069] (017) Linked Collection Total Value
    numericPad(0, 6) + // [070-075] (006) Pledged Collection Bills Count
    formatValue(0, 17) + // [076-092] (017) Pledged Collection Total Value
    numericPad(0, 6) + // [093-098] (006) Discounted Collection Bills Count
    formatValue(0, 17) + // [099-115] (017) Discounted Collection Total Value
    ' '.repeat(8) + // [116-123] (008) Bank Release Notice Number
    ' '.repeat(117); // [124-240] (117) CNAB / FEBRABAN Reserved (Blanks)

  if (linha.length !== 240) {
    throw new Error(
      `CNAB Batch Trailer has ${linha.length} characters (expected 240)`,
    );
  }

  return linha;
}

function buildFileTrailer(totalLotes: number, totalRecords: number): string {
  const linha =
    '756' + // [001-003] (003) Bank Code (Sicoob)
    '9999' + // [004-007] (004) Service Batch (9999 = Master File)
    '9' + // [008-008] (001) Record Type (9 = File Trailer)
    ' '.repeat(9) + // [009-017] (009) CNAB / FEBRABAN Reserved (Blanks)
    numericPad(totalLotes, 6) + // [018-023] (006) Total Batches in File
    numericPad(totalRecords, 6) + // [024-029] (006) Total Records in File
    '000000' + // [030-035] (006) Reconciliation Accounts Count
    ' '.repeat(205); // [036-240] (205) CNAB / FEBRABAN Reserved (Blanks)

  if (linha.length !== 240) {
    throw new Error(
      `CNAB File Trailer has ${linha.length} characters (expected 240)`,
    );
  }

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

  const totalRecordsInLote = 1 + bills.length * 2 + 1;

  lines.push(
    buildBatchTrailer(lote, totalRecordsInLote, bills.length, totalValue),
  );

  const totalRecordsInFile = lines.length + 1;

  lines.push(buildFileTrailer(1, totalRecordsInFile));

  return lines;
}
