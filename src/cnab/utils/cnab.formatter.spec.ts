import {
  numericPad,
  alphaPad,
  formatDate,
  formatTime,
  formatValue,
  formatCpf,
  assertLine240,
} from './cnab.formatter';

describe('numericPad', () => {
  it('pads number with leading zeros', () => {
    expect(numericPad(42, 10)).toBe('0000000042');
  });
  it('strips non-digit characters', () => {
    expect(numericPad('123.456.789-00', 15)).toBe('000012345678900');
  });
  it('takes last N digits if value is longer than length', () => {
    expect(numericPad('99999999999999999', 5)).toBe('99999');
  });
  it('handles zero', () => {
    expect(numericPad(0, 5)).toBe('00000');
  });
});

describe('alphaPad', () => {
  it('pads string with trailing spaces', () => {
    expect(alphaPad('ABC', 5)).toBe('ABC  ');
  });
  it('truncates string to exact length', () => {
    expect(alphaPad('ABCDEFGH', 5)).toBe('ABCDE');
  });
  it('handles null as empty string', () => {
    expect(alphaPad(null, 5)).toBe('     ');
  });
  it('handles undefined as empty string', () => {
    expect(alphaPad(undefined, 4)).toBe('    ');
  });
});

describe('formatDate', () => {
  it('returns DDMMAAAA format for UTC midnight dates (Prisma @db.Date output)', () => {
    expect(formatDate(new Date(Date.UTC(2026, 4, 31)))).toBe('31052026');
  });
  it('pads single-digit day and month', () => {
    expect(formatDate(new Date(Date.UTC(2026, 0, 5)))).toBe('05012026');
  });
  it('does not shift date back in negative UTC offsets (e.g. Brazil UTC-3)', () => {
    // Prisma returns @db.Date as UTC midnight strings: new Date('2026-06-15') = 2026-06-15T00:00:00.000Z
    // In UTC-3, getDate() would return 14 (wrong). getUTCDate() returns 15 (correct).
    expect(formatDate(new Date('2026-06-15'))).toBe('15062026');
    expect(formatDate(new Date('2026-01-01'))).toBe('01012026');
  });
});

describe('formatTime', () => {
  it('returns HHMMSS format', () => {
    const d = new Date(2026, 0, 1, 14, 30, 5);
    expect(formatTime(d)).toBe('143005');
  });
});

describe('formatValue', () => {
  it('converts 100.00 to 15-char zero-padded cents', () => {
    expect(formatValue(100, 15)).toBe('000000000010000');
  });
  it('converts 1234.56 to 15-char zero-padded cents', () => {
    expect(formatValue(1234.56, 15)).toBe('000000000123456');
  });
  it('converts 0 to 15 zeros', () => {
    expect(formatValue(0, 15)).toBe('000000000000000');
  });
  it('supports 17-char total for trailer totals', () => {
    expect(formatValue(100, 17)).toBe('00000000000010000');
  });
  it('accepts Decimal-like object with toString()', () => {
    const decimal = { toString: () => '50.25' };
    expect(formatValue(decimal as any, 15)).toBe('000000000005025');
  });
});

describe('formatCpf', () => {
  it('strips formatting and pads to 15 chars', () => {
    expect(formatCpf('123.456.789-00')).toBe('000012345678900');
  });
  it('handles plain 11-digit CPF', () => {
    expect(formatCpf('12345678900')).toBe('000012345678900');
  });
});

describe('assertLine240', () => {
  it('does not throw for a 240-char string', () => {
    expect(() => assertLine240('A'.repeat(240), 1)).not.toThrow();
  });
  it('throws for a string shorter than 240', () => {
    expect(() => assertLine240('A'.repeat(239), 1)).toThrow('linha 1 tem 239 caracteres');
  });
  it('throws for a string longer than 240', () => {
    expect(() => assertLine240('A'.repeat(241), 1)).toThrow('linha 1 tem 241 caracteres');
  });
});
