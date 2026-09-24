/** Aplica máscara DD/MM/AAAA enquanto o usuário digita. */
export function maskBrDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Converte DD/MM/AAAA → AAAA-MM-DD. Retorna null se inválida. */
export function parseBrDateToIso(raw: string): string | null {
  const match = raw.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/** Converte AAAA-MM-DD → DD/MM/AAAA. */
export function formatIsoToBrDate(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }

  const match = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return '';
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
}

/** Retorna true se a fabricação for posterior à validade (ambas em AAAA-MM-DD). */
export function isManufacturingAfterExpiration(
  manufacturingIso: string,
  expirationIso: string,
): boolean {
  return manufacturingIso > expirationIso;
}
