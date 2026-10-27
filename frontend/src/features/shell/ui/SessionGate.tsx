import type { ReactNode } from 'react';
import { Redirect } from 'expo-router';
import { ROUTES } from '../../../core/routes';
import type { CurrentUser } from '../../auth/model/authTypes';
import { useRequireSession } from '../../auth/model/useRequireSession';
import { SessionError, SessionLoading } from './SessionNotice';

interface SessionGateProps {
  /** Conteúdo para quem tem sessão e equipe. */
  ready: (user: CurrentUser) => ReactNode;
}

/** Decide o que mostrar conforme a sessão: login, carregando, erro, "sem equipe" ou o conteúdo `ready`. */
export function SessionGate({ ready }: SessionGateProps) {
  const session = useRequireSession();
  switch (session.status) {
    case 'anonymous':
      return <Redirect href={ROUTES.login} />;
    case 'loading':
      return <SessionLoading />;
    case 'error':
      return <SessionError message={session.message} onRetry={session.retry} />;
    case 'no-team':
      return <Redirect href={ROUTES.noTeam} />;
    case 'ready':
      return <>{ready(session.user)}</>;
  }
}
