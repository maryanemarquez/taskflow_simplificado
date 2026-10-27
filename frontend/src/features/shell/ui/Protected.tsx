import type { ReactNode } from 'react';
import { SessionUserProvider } from '../../auth/model/SessionUserContext';
import { AppShell } from './AppShell';
import { SessionGate } from './SessionGate';

/** Exige sessão e equipe: sem token vai ao login; sem equipe vai à tela "Sem equipe". Os filhos leem o usuário com `useSessionUser`. */
export function Protected({ children }: { children: ReactNode }) {
  return (
    <SessionGate
      ready={(user) => (
        <SessionUserProvider user={user}>
          <AppShell user={user}>{children}</AppShell>
        </SessionUserProvider>
      )}
    />
  );
}
