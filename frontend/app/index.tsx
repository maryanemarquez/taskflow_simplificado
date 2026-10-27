import { Redirect } from 'expo-router';
import { ROUTES } from '../src/core/routes';
import { SessionGate } from '../src/features/shell/ui/SessionGate';

export default function IndexRoute() {
  return <SessionGate ready={() => <Redirect href={ROUTES.dashboard} />} />;
}
