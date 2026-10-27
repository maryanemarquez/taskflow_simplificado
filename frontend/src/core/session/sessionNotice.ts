import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
let expired = false;

function setExpired(value: boolean) {
  if (expired === value) {
    return;
  }
  expired = value;
  listeners.forEach((listener) => listener());
}

/** Aviso de que o servidor encerrou a sessão; a tela de login o mostra até a pessoa entrar de novo. */
export const sessionNotice = {
  markExpired: () => setExpired(true),
  clear: () => setExpired(false),
  isExpired: () => expired,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useSessionExpired() {
  return useSyncExternalStore(sessionNotice.subscribe, sessionNotice.isExpired, sessionNotice.isExpired);
}
