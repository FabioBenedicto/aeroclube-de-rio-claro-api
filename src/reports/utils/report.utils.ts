import * as ExcelJS from 'exceljs';

export function reportFilename(base: string): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const dot = base.lastIndexOf('.');
  return dot === -1
    ? `${base}-${stamp}`
    : `${base.slice(0, dot)}-${stamp}${base.slice(dot)}`;
}

export async function buildExcel(
  sheetName: string,
  columns: { header: string; key: string; width?: number }[],
  rows: Record<string, unknown>[],
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width,
  }));

  rows.forEach((row) => worksheet.addRow(row));

  const excel_buffer = await workbook.xlsx.writeBuffer();
  const buffer = Buffer.from(excel_buffer);

  return buffer;
}
