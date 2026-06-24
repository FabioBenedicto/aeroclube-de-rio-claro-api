export function numericPad(value: string | number, length: number): string {
  const digits = String(value).replace(/\D/g, '');
  return digits.padStart(length, '0').slice(-length);
}

export function alphaPad(
  value: string | null | undefined,
  length: number,
): string {
  return (value ?? '').slice(0, length).padEnd(length, ' ');
}

export function formatDate(date: Date): string {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getUTCFullYear());
  return `${dd}${mm}${yyyy}`;
}

export function formatTime(date: Date): string {
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mi = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${hh}${mi}${ss}`;
}

export function formatValue(
  value: number | { toString(): string },
  totalChars: number,
): string {
  const num = parseFloat(String(value));
  const cents = Math.round(num * 100);
  return String(cents).padStart(totalChars, '0');
}

export function formatCpf(cpf: string): string {
  return cpf.replace(/\D/g, '').padStart(15, '0');
}
