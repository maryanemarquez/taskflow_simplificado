const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Converte AAAA-MM-DD (formato da API) em DD/MM/AAAA; devolve o texto original se não casar. */
export function isoToBr(iso: string): string {
  const found = ISO_DATE.exec(iso);
  return found ? `${found[3]}/${found[2]}/${found[1]}` : iso;
}
