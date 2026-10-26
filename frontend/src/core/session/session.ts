import { useSyncExternalStore } from 'react';

const TOKEN_KEY = 'taskflow-token';
const listeners = new Set<() => void>();

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

let currentToken = readToken();

function setStoredToken(value: string | null) {
  currentToken = value;
  try {
    if (value) {
      localStorage.setItem(TOKEN_KEY, value);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Sem armazenamento disponível: o token fica só em memória.
  }
  listeners.forEach((listener) => listener());
}

export const session = {
  getToken: () => currentToken,
  setToken: (value: string) => setStoredToken(value),
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
