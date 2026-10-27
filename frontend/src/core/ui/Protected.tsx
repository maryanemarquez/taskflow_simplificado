import type { ReactNode } from 'react';
import { Redirect } from 'expo-router';
import { useRequireSession } from '../../features/auth/model/useRequireSession';
import type { CurrentUser } from '../../features/auth/model/authTypes';
import { AppShell } from './AppShell';
import { SessionError, SessionLoading } from './SessionNotice';

interface ProtectedProps {
  children: (user: CurrentUser) => ReactNode;
}

/** Exige sessão e equipe: sem token vai ao login; sem equipe vai à tela "Sem equipe". */
export function Protected({ children }: ProtectedProps) {
  const session = useRequireSession();
  switch (session.status) {
    case 'anonymous':
      return <Redirect href="/login" />;
    case 'loading':
      return <SessionLoading />;
    case 'error':
      return <SessionError message={session.message} onRetry={session.retry} />;
    case 'no-team':
      return <Redirect href="/sem-equipe" />;
    case 'ready':
      return <AppShell user={session.user}>{children(session.user)}</AppShell>;
  }
}
