const BR_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function isRealDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Aplica a máscara DD/MM/AAAA enquanto a pessoa digita (só dígitos, no máximo 8). */
export function maskBrDate(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Converte DD/MM/AAAA em AAAA-MM-DD; devolve null se o texto não for uma data real. */
export function brToIso(text: string): string | null {
  const found = BR_DATE.exec(text.trim());
  if (!found) {
    return null;
  }
  const [, day, month, year] = found;
  return isRealDate(Number(year), Number(month), Number(day)) ? `${year}-${month}-${day}` : null;
}

/** Converte AAAA-MM-DD (formato da API) em DD/MM/AAAA; devolve o texto original se não casar. */
export function isoToBr(iso: string): string {
  const found = ISO_DATE.exec(iso);
  return found ? `${found[3]}/${found[2]}/${found[1]}` : iso;
}
