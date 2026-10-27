/** Acesso ao localStorage que nunca lança: sem armazenamento (nativo, modo privado), lê `null` e ignora gravações. */
export const safeStorage = {
  get(key: string): string | null {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // sem armazenamento: o valor vale só em memória
    }
  },
  remove(key: string): void {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // sem armazenamento: nada a remover
    }
  },
};
