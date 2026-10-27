import { useSyncExternalStore } from 'react';
import { safeStorage } from '../storage/safeStorage';
import { sessionNotice } from './sessionNotice';

const TOKEN_KEY = 'taskflow-token';
const EXPIRY_KEY = 'taskflow-token-expires-at';
/** Maior atraso que `setTimeout` aceita; o token do backend dura 8 h, bem abaixo disso. */
const MAX_TIMER_MS = 2_147_483_647;
const listeners = new Set<() => void>();

let currentToken: string | null = null;
let expiryTimer: ReturnType<typeof setTimeout> | null = null;

/** Instante de expiração em milissegundos, ou null quando ausente ou ilegível. */
function parseExpiry(value: string | null): number | null {
  const time = value ? Date.parse(value) : Number.NaN;
  return Number.isNaN(time) ? null : time;
}

function cancelExpiryTimer() {
  if (expiryTimer !== null) {
    clearTimeout(expiryTimer);
    expiryTimer = null;
  }
}

/** Agenda o logout para o instante em que o token vence, para a tela não ficar com sessão morta. */
function scheduleExpiry(expiresAt: number | null) {
  cancelExpiryTimer();
  if (expiresAt === null) {
    return;
  }
  expiryTimer = setTimeout(expireSession, Math.min(Math.max(expiresAt - Date.now(), 0), MAX_TIMER_MS));
  // Em Node (testes) o timer não deve manter o processo vivo; no app esse método não existe.
  (expiryTimer as { unref?: () => void }).unref?.();
}

function store(token: string | null, expiresAt: string | null) {
  currentToken = token;
  // Sem armazenamento disponível (app nativo, modo privado), o token fica só em memória.
  if (token) {
    safeStorage.set(TOKEN_KEY, token);
  } else {
    safeStorage.remove(TOKEN_KEY);
  }
  if (token && expiresAt) {
    safeStorage.set(EXPIRY_KEY, expiresAt);
  } else {
    safeStorage.remove(EXPIRY_KEY);
  }
  scheduleExpiry(token ? parseExpiry(expiresAt) : null);
  listeners.forEach((listener) => listener());
}

/** O token venceu: encerra a sessão e deixa o aviso de "sessão expirada" para a tela de login. */
function expireSession() {
  if (currentToken === null) {
    return;
  }
  store(null, null);
  sessionNotice.markExpired();
}

function restoreSession() {
  const token = safeStorage.get(TOKEN_KEY);
  if (!token) {
    return;
  }
  const expiresAt = safeStorage.get(EXPIRY_KEY);
  const expiry = parseExpiry(expiresAt);
  if (expiry !== null && expiry <= Date.now()) {
    // Token guardado já venceu: descarta antes da primeira chamada à API (que responderia 401).
    safeStorage.remove(TOKEN_KEY);
    safeStorage.remove(EXPIRY_KEY);
    sessionNotice.markExpired();
    return;
  }
  currentToken = token;
  scheduleExpiry(expiry);
}

restoreSession();

export const session = {
  getToken: () => currentToken,
  /** `expiresAt` é o `accessTokenExpiraEm` da resposta de login (ISO 8601); sem ele o token não expira no cliente. */
  setToken: (value: string, expiresAt?: string) => {
    sessionNotice.clear();
    store(value, expiresAt ?? null);
  },
  clear: () => store(null, null),
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
