import * as ExcelJS from 'exceljs';

export function reportFilename(base: string): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const dot = base.lastIndexOf('.');
  return dot === -1 ? `${base}-${stamp}` : `${base.slice(0, dot)}-${stamp}${base.slice(dot)}`;
}

export async function buildExcel(
  sheetName: string,
  columns: { header: string; key: string; width?: number }[],
  rows: Record<string, unknown>[],
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);

  ws.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width ?? 22,
  }));

  rows.forEach((row) => ws.addRow(row));

  return wb.xlsx.writeBuffer() as unknown as Promise<Buffer>;
}
