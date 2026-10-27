import { Protected } from '../src/features/shell/ui/Protected';
import { MembersScreen } from '../src/features/membros/ui/MembersScreen';

export default function MembersRoute() {
  return <Protected>{(user) => <MembersScreen user={user} />}</Protected>;
}
