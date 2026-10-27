const UUID_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

/**
 * Id de correlação (UUID v4), aceito pelo backend (`[A-Za-z0-9-]{1,64}`). Usa `crypto.randomUUID` quando existe;
 * no Hermes (celular) e em páginas sem contexto seguro cai num gerador próprio: o id só correlaciona logs, não protege nada.
 */
export function newRequestId(): string {
  const native = globalThis.crypto?.randomUUID?.();
  if (native) {
    return native;
  }
  return UUID_TEMPLATE.replace(/[xy]/g, (char) => {
    const digit = Math.floor(Math.random() * 16);
    return (char === 'x' ? digit : (digit % 4) + 8).toString(16);
  });
}
