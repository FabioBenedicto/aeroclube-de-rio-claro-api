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
  sicoob_agencia?: string | null;
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
    '0' +                                    // 008 tipo registro
    ' '.repeat(9) +                          // 009-017 CNAB
    '2' +                                    // 018 tipo inscrição (CNPJ)
    numericPad(s.sicoob_cnpj, 14) +          // 019-032 CNPJ
    ' '.repeat(20) +                         // 033-052 convênio
    numericPad(s.sicoob_cooperativa_prefix, 5) + // 053-057 prefixo coop
    alphaPad(s.sicoob_cooperativa_dv, 1) +   // 058 DV prefixo
    numericPad(s.sicoob_conta, 12) +         // 059-070 conta
    numericPad(s.sicoob_conta_dv, 1) +       // 071 DV conta
    '0' +                                    // 072 DV ag/conta
    alphaPad(s.sicoob_nome_empresa, 30) +    // 073-102 nome empresa
    alphaPad('SICOOB', 30) +                 // 103-132 nome banco
    ' '.repeat(10) +                         // 133-142 CNAB
    '1' +                                    // 143 código remessa
    formatDate(now) +                        // 144-151 data geração
    formatTime(now) +                        // 152-157 hora geração
    numericPad(s.sicoob_remessa_sequence, 6) + // 158-163 NSA
    '081' +                                  // 164-166 versão layout
    '00000' +                                // 167-171 densidade
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
    '1' +                                    // 008 tipo registro
    'R' +                                    // 009 operação remessa
    '01' +                                   // 010-011 serviço cobrança
    '  ' +                                   // 012-013 CNAB
    '040' +                                  // 014-016 versão layout lote
    ' ' +                                    // 017 CNAB
    '2' +                                    // 018 tipo inscrição (CNPJ)
    numericPad(s.sicoob_cnpj, 15) +          // 019-033 CNPJ 15 dígitos
    ' '.repeat(20) +                         // 034-053 convênio
    numericPad(s.sicoob_cooperativa_prefix, 5) + // 054-058 prefixo coop
    alphaPad(s.sicoob_cooperativa_dv, 1) +   // 059 DV prefixo
    numericPad(s.sicoob_conta, 12) +         // 060-071 conta
    numericPad(s.sicoob_conta_dv, 1) +       // 072 DV conta
    ' ' +                                    // 073 DV ag/conta
    alphaPad(s.sicoob_nome_empresa, 30) +    // 074-103 nome empresa
    ' '.repeat(40) +                         // 104-143 mensagem 1
    ' '.repeat(40) +                         // 144-183 mensagem 2
    numericPad(s.sicoob_remessa_sequence, 8) + // 184-191 NSA remessa
    formatDate(now) +                        // 192-199 data gravação
    '00000000' +                             // 200-207 data crédito
    ' '.repeat(33);                          // 208-240 CNAB
  assertLine240(linha, 1);
  return linha;
}

function buildSegmentoP(s: SicoobSettings, bill: BillWithCustomer, seq: number, lote: number): string {
  const nossoNumero =
    '0000000000' +                           // 10 zeros (Sicoob emite)
    '01' +                                   // parcela única
    numericPad(s.sicoob_modalidade, 2) +     // modalidade
    '4' +                                    // tipo formulário A4
    '     ';                                 // 5 espaços

  const linha =
    '756' +                                  // 001-003 banco
    numericPad(lote, 4) +                    // 004-007 lote
    '3' +                                    // 008 tipo registro
    numericPad(seq, 5) +                     // 009-013 nº seq registro
    'P' +                                    // 014 segmento
    ' ' +                                    // 015 CNAB
    '01' +                                   // 016-017 cód movimento entrada
    numericPad(s.sicoob_agencia ?? s.sicoob_cooperativa_prefix, 5) + // 018-022 agência mantenedora
    alphaPad(s.sicoob_cooperativa_dv, 1) +   // 023 DV prefixo
    numericPad(s.sicoob_conta, 12) +         // 024-035 conta
    numericPad(s.sicoob_conta_dv, 1) +       // 036 DV conta
    ' ' +                                    // 037 DV ag/conta
    nossoNumero +                            // 038-057 nosso número (20 chars)
    numericPad(s.sicoob_carteira, 1) +       // 058 carteira
    '0' +                                    // 059 cadastramento
    ' ' +                                    // 060 tipo documento
    '1' +                                    // 061 emissão Sicoob
    '2' +                                    // 062 distribuição a cargo da empresa
    numericPad(bill.id, 15) +                // 063-077 nº documento = bill.id
    formatDate(bill.due_date) +              // 078-085 vencimento
    formatValue(bill.total_amount, 15) +     // 086-100 valor nominal (13+2)
    '00000' +                                // 101-105 ag cobradora
    ' ' +                                    // 106 DV ag cobradora
    '04' +                                   // 107-108 espécie DS
    'N' +                                    // 109 aceite não aceite
    formatDate(bill.issue_date) +            // 110-117 data emissão
    (s.sicoob_juros > 0 ? '2' : '0') +      // 118 código juros (2=taxa mensal, 0=isento)
    (() => {
      if (s.sicoob_juros <= 0) return '00000000';
      const d = new Date(bill.due_date);
      d.setUTCDate(d.getUTCDate() + Math.max(s.sicoob_juros_prazo, 1));
      return formatDate(d);
    })() +                                   // 119-126 data início juros (obrigatório quando código != 0)
    formatValue(s.sicoob_juros, 15) +        // 127-141 juros mora % mensal (15 chars = 13+2 decimais)
    '0' +                                    // 142 cód desconto 1
    '00000000' +                             // 143-150 data desconto 1
    '000000000000000' +                      // 151-165 desconto 1 (15 chars)
    '000000000000000' +                      // 166-180 IOF (15 chars)
    '000000000000000' +                      // 181-195 abatimento (15 chars)
    alphaPad(String(bill.id), 25) +          // 196-220 uso empresa
    '3' +                                    // 221 não protestar
    '00' +                                   // 222-223 prazo protesto
    '0' +                                    // 224 código baixa
    '   ' +                                  // 225-227 prazo baixa
    '09' +                                   // 228-229 código moeda Real
    '0000000000' +                           // 230-239 nº contrato
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
    '3' +                                    // 008 tipo registro
    numericPad(seq, 5) +                     // 009-013 nº seq registro
    'Q' +                                    // 014 segmento
    ' ' +                                    // 015 CNAB
    '01' +                                   // 016-017 cód movimento
    '1' +                                    // 018 tipo inscrição CPF
    formatCpf(bill.customer.cpf) +           // 019-033 CPF (15 chars)
    alphaPad(bill.customer.name, 40) +       // 034-073 nome (40 chars)
    alphaPad(bill.customer.address, 40) +    // 074-113 endereço (40 chars)
    alphaPad(bill.customer.neighborhood, 15) + // 114-128 bairro (15 chars)
    numericPad(cep1, 5) +                    // 129-133 CEP parte 1
    numericPad(cep2, 3) +                    // 134-136 CEP sufixo
    alphaPad(bill.customer.city, 15) +       // 137-151 cidade (15 chars)
    alphaPad(bill.customer.state, 2) +       // 152-153 UF
    '0' +                                    // 154 sacador isento
    '000000000000000' +                      // 155-169 inscrição sacador
    ' '.repeat(40) +                         // 170-209 nome sacador
    '000' +                                  // 210-212 cód banco correspondente
    ' '.repeat(20) +                         // 213-232 nosso nº banco corresp
    ' '.repeat(8);                           // 233-240 CNAB
  assertLine240(linha, seq);
  return linha;
}

function buildBatchTrailer(lote: number, totalRecords: number, billCount: number, totalValue: number): string {
  const linha =
    '756' +                                  // 001-003 banco
    numericPad(lote, 4) +                    // 004-007 lote
    '5' +                                    // 008 tipo registro
    ' '.repeat(9) +                          // 009-017 CNAB
    numericPad(totalRecords, 6) +            // 018-023 qtd registros lote
    numericPad(billCount, 6) +               // 024-029 qtd títulos simples
    formatValue(totalValue, 17) +            // 030-046 valor total (15+2=17)
    numericPad(0, 6) +                       // 047-052 qtd vinculada
    formatValue(0, 17) +                     // 053-069 valor vinculada
    numericPad(0, 6) +                       // 070-075 qtd caucionada
    formatValue(0, 17) +                     // 076-092 valor caucionada
    numericPad(0, 6) +                       // 093-098 qtd descontada
    formatValue(0, 17) +                     // 099-115 valor descontada
    ' '.repeat(8) +                          // 116-123 nº aviso
    ' '.repeat(117);                         // 124-240 CNAB
  assertLine240(linha, -1);
  return linha;
}

function buildFileTrailer(totalLotes: number, totalRecords: number): string {
  const linha =
    '756' +                                  // 001-003 banco
    '9999' +                                 // 004-007 lote
    '9' +                                    // 008 tipo registro
    ' '.repeat(9) +                          // 009-017 CNAB
    numericPad(totalLotes, 6) +              // 018-023 qtd lotes
    numericPad(totalRecords, 6) +            // 024-029 qtd registros totais
    '000000' +                               // 030-035 qtd contas concil
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
