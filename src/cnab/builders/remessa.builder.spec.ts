import { buildRemessaLines } from './remessa.builder';

const mockSettings = {
  sicoob_cooperativa_prefix: '04162',
  sicoob_cooperativa_dv: '0',
  sicoob_conta: '000007550000',
  sicoob_conta_dv: '0',
  sicoob_carteira: '1',
  sicoob_modalidade: '01',
  sicoob_cnpj: '12345678000100',
  sicoob_nome_empresa: 'AEROCLUBE RIO CLARO',
  sicoob_remessa_sequence: 1,
  sicoob_juros: 0,
  sicoob_juros_prazo: 0,
};

const mockBill = {
  id: 42,
  total_amount: { toString: () => '150.00' },
  due_date: new Date(Date.UTC(2026, 5, 15)),   // 15/06/2026 — Prisma @db.Date as UTC midnight
  issue_date: new Date(Date.UTC(2026, 4, 31)), // 31/05/2026 — Prisma @db.Date as UTC midnight
  customer: {
    cpf: '123.456.789-00',
    name: 'JOAO DA SILVA',
    address: 'RUA EXEMPLO 123',
    neighborhood: 'CENTRO',
    city: 'RIO CLARO',
    state: 'SP',
    zip_code: '13500300',
  },
};

const generationDate = new Date(2026, 4, 31, 10, 0, 0); // 31/05/2026 10:00:00

describe('buildRemessaLines', () => {
  let lines: string[];

  beforeEach(() => {
    lines = buildRemessaLines(mockSettings as any, [mockBill as any], generationDate);
  });

  it('generates the correct number of lines (header + batchHeader + P + Q + batchTrailer + fileTrailer)', () => {
    expect(lines).toHaveLength(6);
  });

  it('every line is exactly 240 characters', () => {
    lines.forEach((line, i) => {
      expect(line).toHaveLength(240);
    });
  });

  describe('File Header (line 0)', () => {
    it('starts with bank code 756', () => {
      expect(lines[0].substring(0, 3)).toBe('756');
    });
    it('has lote 0000', () => {
      expect(lines[0].substring(3, 7)).toBe('0000');
    });
    it('has record type 0', () => {
      expect(lines[0].charAt(7)).toBe('0');
    });
    it('has remessa code 1 at position 143 (0-indexed: 142)', () => {
      expect(lines[0].charAt(142)).toBe('1');
    });
    it('has generation date at positions 144-151 (0-indexed: 143-150)', () => {
      expect(lines[0].substring(143, 151)).toBe('31052026');
    });
    it('has layout version 081 at positions 164-166 (0-indexed: 163-165)', () => {
      expect(lines[0].substring(163, 166)).toBe('081');
    });
  });

  describe('Batch Header (line 1)', () => {
    it('has record type 1', () => {
      expect(lines[1].charAt(7)).toBe('1');
    });
    it('has operation type R at position 9 (0-indexed: 8)', () => {
      expect(lines[1].charAt(8)).toBe('R');
    });
    it('has service type 01 at positions 10-11 (0-indexed: 9-10)', () => {
      expect(lines[1].substring(9, 11)).toBe('01');
    });
  });

  describe('Segmento P (line 2)', () => {
    it('has record type 3', () => {
      expect(lines[2].charAt(7)).toBe('3');
    });
    it('has segment P at position 14 (0-indexed: 13)', () => {
      expect(lines[2].charAt(13)).toBe('P');
    });
    it('has movement code 01 at positions 16-17 (0-indexed: 15-16)', () => {
      expect(lines[2].substring(15, 17)).toBe('01');
    });
    it('has bill.id zero-padded at positions 63-77 (0-indexed: 62-76)', () => {
      expect(lines[2].substring(62, 77)).toBe('000000000000042');
    });
    it('has due_date at positions 78-85 (0-indexed: 77-84)', () => {
      expect(lines[2].substring(77, 85)).toBe('15062026');
    });
    it('has total_amount (R$150.00) at positions 86-100 (0-indexed: 85-99)', () => {
      expect(lines[2].substring(85, 100)).toBe('000000000015000');
    });
    it('has especie DS (04) at positions 107-108 (0-indexed: 106-107)', () => {
      expect(lines[2].substring(106, 108)).toBe('04');
    });
    it('has distribution code 2 (empresa) at position 62 (0-indexed: 61)', () => {
      expect(lines[2].charAt(61)).toBe('2');
    });
    it('has interest code 0 (isento) when sicoob_juros=0 at position 118 (0-indexed: 117)', () => {
      expect(lines[2].charAt(117)).toBe('0');
    });
    it('has interest date 00000000 when sicoob_juros=0 at positions 119-126 (0-indexed: 118-125)', () => {
      expect(lines[2].substring(118, 126)).toBe('00000000');
    });
  });

  describe('Segmento P com juros configurados', () => {
    it('has interest code 2 and date=due_date when sicoob_juros>0 and prazo=0', () => {
      const settingsWithJuros = { ...mockSettings, sicoob_juros: 1, sicoob_juros_prazo: 0 };
      const linesWithJuros = buildRemessaLines(settingsWithJuros as any, [mockBill as any], generationDate);
      expect(linesWithJuros[2].charAt(117)).toBe('2');
      expect(linesWithJuros[2].substring(118, 126)).toBe('15062026'); // due_date
    });
    it('has interest date=due_date+prazo when sicoob_juros>0 and prazo=5', () => {
      const settingsWithPrazo = { ...mockSettings, sicoob_juros: 1, sicoob_juros_prazo: 5 };
      const linesWithPrazo = buildRemessaLines(settingsWithPrazo as any, [mockBill as any], generationDate);
      expect(linesWithPrazo[2].charAt(117)).toBe('2');
      expect(linesWithPrazo[2].substring(118, 126)).toBe('20062026'); // 15/06 + 5 = 20/06
    });
  });

  describe('Segmento Q (line 3)', () => {
    it('has record type 3', () => {
      expect(lines[3].charAt(7)).toBe('3');
    });
    it('has segment Q at position 14 (0-indexed: 13)', () => {
      expect(lines[3].charAt(13)).toBe('Q');
    });
    it('has CPF type 1 at position 18 (0-indexed: 17)', () => {
      expect(lines[3].charAt(17)).toBe('1');
    });
    it('has CPF zero-padded to 15 at positions 19-33 (0-indexed: 18-32)', () => {
      expect(lines[3].substring(18, 33)).toBe('000012345678900');
    });
    it('has customer name padded to 40 at positions 34-73 (0-indexed: 33-72)', () => {
      const nameField = lines[3].substring(33, 73);
      expect(nameField).toHaveLength(40);
      expect(nameField.startsWith('JOAO DA SILVA')).toBe(true);
    });
  });

  describe('Batch Trailer (line 4)', () => {
    it('has record type 5', () => {
      expect(lines[4].charAt(7)).toBe('5');
    });
    it('has record count of 4 at positions 18-23 (0-indexed: 17-22)', () => {
      expect(lines[4].substring(17, 23)).toBe('000004');
    });
  });

  describe('File Trailer (line 5)', () => {
    it('has record type 9', () => {
      expect(lines[5].charAt(7)).toBe('9');
    });
    it('has lote 9999 at positions 4-7 (0-indexed: 3-6)', () => {
      expect(lines[5].substring(3, 7)).toBe('9999');
    });
    it('has total record count at positions 24-29 (0-indexed: 23-28)', () => {
      expect(lines[5].substring(23, 29)).toBe('000006');
    });
  });
});
