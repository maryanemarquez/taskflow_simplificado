import { Protected } from '../src/features/shell/ui/Protected';
import { DashboardScreen } from '../src/features/dashboard/ui/DashboardScreen';

export default function DashboardRoute() {
  return <Protected>{() => <DashboardScreen />}</Protected>;
}
