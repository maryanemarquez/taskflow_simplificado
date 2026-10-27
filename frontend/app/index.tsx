import { Redirect } from 'expo-router';
import { SessionError, SessionLoading } from '../src/core/ui/SessionNotice';
import { useRequireSession } from '../src/features/auth/model/useRequireSession';

export default function IndexRoute() {
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
      return <Redirect href="/dashboard" />;
  }
}
