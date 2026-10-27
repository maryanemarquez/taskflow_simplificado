import type { ReactNode } from 'react';
import type { CurrentUser } from '../../auth/model/authTypes';
import { AppShell } from './AppShell';
import { SessionGate } from './SessionGate';

interface ProtectedProps {
  children: (user: CurrentUser) => ReactNode;
}

/** Exige sessão e equipe: sem token vai ao login; sem equipe vai à tela "Sem equipe". */
export function Protected({ children }: ProtectedProps) {
  return <SessionGate ready={(user) => <AppShell user={user}>{children(user)}</AppShell>} />;
}
