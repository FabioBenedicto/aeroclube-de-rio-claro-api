export type PaidEntry = {
  billId: number;
  paymentDate: Date;
  valorPago: number;
};

export type RetornoResult = {
  paid: PaidEntry[];
  rejected: number[];
  errors: string[];
};

function parseDateCnab(s: string): Date {
  // DDMMAAAA
  const dd = parseInt(s.substring(0, 2), 10);
  const mm = parseInt(s.substring(2, 4), 10) - 1;
  const yyyy = parseInt(s.substring(4, 8), 10);
  return new Date(yyyy, mm, dd);
}

export function parseRetorno(content: string): RetornoResult {
  const result: RetornoResult = { paid: [], rejected: [], errors: [] };
  const lines = content.split(/\r?\n/).filter((l) => l.length >= 14);

  let pendingT: { billId: number; movementCode: string } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const tipoRegistro = line.charAt(7);
    const segmento = line.charAt(13);

    if (tipoRegistro !== '3') {
      pendingT = null;
      continue;
    }

    if (segmento === 'T') {
      const movementCode = line.substring(15, 17).trim();
      const billIdStr = line.substring(58, 73).trim();
      const billId = parseInt(billIdStr, 10);

      if (isNaN(billId) || billId <= 0) {
        result.errors.push(`Linha ${i + 1}: nº do documento inválido "${billIdStr}"`);
        pendingT = null;
        continue;
      }

      if (movementCode === '03') {
        result.rejected.push(billId);
        pendingT = null;
        continue;
      }

      pendingT = { billId, movementCode };
      continue;
    }

    if (segmento === 'U' && pendingT !== null) {
      const movementCode = line.substring(15, 17).trim();

      if (movementCode === '06' || movementCode === '17') {
        const valorPagoStr = line.substring(77, 92);
        const dataOcorrStr = line.substring(137, 145);

        const cents = parseInt(valorPagoStr, 10);
        const valorPago = isNaN(cents) ? 0 : cents / 100;
        const paymentDate = parseDateCnab(dataOcorrStr);

        result.paid.push({ billId: pendingT.billId, paymentDate, valorPago });
      }

      pendingT = null;
      continue;
    }

    pendingT = null;
  }

  return result;
}
