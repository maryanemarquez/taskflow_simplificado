import { createContext, useContext, type ReactNode } from 'react';
import type { CurrentUser } from './authTypes';

const SessionUserContext = createContext<CurrentUser | null>(null);

/** Entrega o usuário autenticado às telas dentro de `Protected`. */
export function SessionUserProvider({ user, children }: { user: CurrentUser; children: ReactNode }) {
  return <SessionUserContext.Provider value={user}>{children}</SessionUserContext.Provider>;
}

/** Usuário autenticado. Só vale dentro de `Protected`. */
export function useSessionUser(): CurrentUser {
  const user = useContext(SessionUserContext);
  if (!user) {
    throw new Error('useSessionUser precisa estar dentro de <Protected>.');
  }
  return user;
}
