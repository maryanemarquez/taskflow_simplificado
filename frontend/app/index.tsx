import { Redirect } from 'expo-router';
import { SessionError, SessionLoading } from '../src/features/shell/ui/SessionNotice';
import { useRequireSession } from '../src/features/auth/model/useRequireSession';
import { ROUTES } from '../src/core/routes';

export default function IndexRoute() {
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
      return <Redirect href={ROUTES.dashboard} />;
  }
}
