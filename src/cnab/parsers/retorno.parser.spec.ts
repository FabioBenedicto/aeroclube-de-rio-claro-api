import { parseRetorno, RetornoResult } from './retorno.parser';

function padLine(content: string): string {
  return content.padEnd(240, ' ');
}

// Build a minimal Segmento T line
function makeSegmentoT(billId: number, movimentoCod: string): string {
  const line = [
    '756',                               // 001-003 banco
    '0001',                              // 004-007 lote
    '3',                                 // 008 tipo registro
    '00001',                             // 009-013 seq
    'T',                                 // 014 segmento
    ' ',                                 // 015 CNAB
    movimentoCod.padStart(2, '0'),       // 016-017 cód movimento
    ' '.repeat(41),                      // 018-058 (prefixo, conta, nosso nº, carteira)
    String(billId).padStart(15, '0'),    // 059-073 nº documento = bill_id
  ].join('');
  return padLine(line);
}

// Build a minimal Segmento U line
function makeSegmentoU(valorPago: number, dataOcorrencia: string, movimentoCod: string): string {
  const juros      = '000000000000000'; // 18-32  acréscimos (15 chars)
  const desconto   = '000000000000000'; // 33-47  (15 chars)
  const abatimento = '000000000000000'; // 48-62  (15 chars)
  const iof        = '000000000000000'; // 63-77  (15 chars)
  const pago       = String(Math.round(valorPago * 100)).padStart(15, '0'); // 78-92
  const liquido    = '000000000000000'; // 93-107 (15 chars)
  const despesas   = '000000000000000'; // 108-122 (15 chars)
  const creditos   = '000000000000000'; // 123-137 (15 chars)
  const dataOcorr  = dataOcorrencia;    // 138-145 (8 chars)

  const line = [
    '756',                                   // 001-003
    '0001',                                  // 004-007
    '3',                                     // 008
    '00002',                                 // 009-013
    'U',                                     // 014
    ' ',                                     // 015
    movimentoCod.padStart(2, '0'),           // 016-017
    juros + desconto + abatimento + iof +    // 018-077 (60 chars)
    pago +                                   // 078-092 (15 chars)
    liquido + despesas + creditos +          // 093-137 (45 chars)
    dataOcorr,                               // 138-145 (8 chars)
  ].join('');
  return padLine(line);
}

describe('parseRetorno', () => {
  it('returns empty arrays for a file with no detail records', () => {
    const content = [
      padLine('756' + '0000' + '0'), // file header
      padLine('756' + '9999' + '9'), // file trailer
    ].join('\r\n');
    const result = parseRetorno(content);
    expect(result.paid).toHaveLength(0);
    expect(result.rejected).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it('marks bill as paid for movement code 06 (Liquidação)', () => {
    const tLine = makeSegmentoT(42, '06');
    const uLine = makeSegmentoU(150, '31052026', '06');
    const content = [
      padLine('756' + '0000' + '0'),
      padLine('756' + '0001' + '1'),
      tLine,
      uLine,
      padLine('756' + '0001' + '5'),
      padLine('756' + '9999' + '9'),
    ].join('\r\n');

    const result = parseRetorno(content);
    expect(result.paid).toHaveLength(1);
    expect(result.paid[0].billId).toBe(42);
    expect(result.paid[0].paymentDate).toEqual(new Date(2026, 4, 31)); // 31/05/2026
    expect(result.paid[0].valorPago).toBe(150);
  });

  it('marks bill as paid for movement code 17 (Liquidação após baixa)', () => {
    const tLine = makeSegmentoT(99, '17');
    const uLine = makeSegmentoU(200, '01062026', '17');
    const content = [
      padLine('756' + '0000' + '0'),
      padLine('756' + '0001' + '1'),
      tLine,
      uLine,
      padLine('756' + '0001' + '5'),
      padLine('756' + '9999' + '9'),
    ].join('\r\n');

    const result = parseRetorno(content);
    expect(result.paid).toHaveLength(1);
    expect(result.paid[0].billId).toBe(99);
  });

  it('adds to rejected for movement code 03 (Entrada Rejeitada)', () => {
    const tLine = makeSegmentoT(55, '03');
    const uLine = makeSegmentoU(0, '00000000', '03');
    const content = [
      padLine('756' + '0000' + '0'),
      padLine('756' + '0001' + '1'),
      tLine,
      uLine,
      padLine('756' + '0001' + '5'),
      padLine('756' + '9999' + '9'),
    ].join('\r\n');

    const result = parseRetorno(content);
    expect(result.rejected).toContain(55);
    expect(result.paid).toHaveLength(0);
  });

  it('parses multiple bills', () => {
    const lines = [
      padLine('756' + '0000' + '0'),
      padLine('756' + '0001' + '1'),
      makeSegmentoT(10, '06'),
      makeSegmentoU(100, '31052026', '06'),
      makeSegmentoT(20, '06'),
      makeSegmentoU(200, '31052026', '06'),
      padLine('756' + '0001' + '5'),
      padLine('756' + '9999' + '9'),
    ];
    const result = parseRetorno(lines.join('\r\n'));
    expect(result.paid).toHaveLength(2);
    expect(result.paid.map((p) => p.billId)).toEqual([10, 20]);
  });
});
