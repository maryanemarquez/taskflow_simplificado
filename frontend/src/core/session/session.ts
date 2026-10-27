import { useSyncExternalStore } from 'react';
import { safeStorage } from '../storage/safeStorage';
import { sessionNotice } from './sessionNotice';

const TOKEN_KEY = 'taskflow-token';
const listeners = new Set<() => void>();

let currentToken = safeStorage.get(TOKEN_KEY);

function setStoredToken(value: string | null) {
  currentToken = value;
  // Sem armazenamento disponível, o token fica só em memória.
  if (value) {
    safeStorage.set(TOKEN_KEY, value);
  } else {
    safeStorage.remove(TOKEN_KEY);
  }
  listeners.forEach((listener) => listener());
}

export const session = {
  getToken: () => currentToken,
  setToken: (value: string) => {
    sessionNotice.clear();
    setStoredToken(value);
  },
  clear: () => setStoredToken(null),
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useToken() {
  return useSyncExternalStore(session.subscribe, session.getToken, session.getToken);
}
