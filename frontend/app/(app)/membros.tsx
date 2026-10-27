import { useSessionUser } from '../../src/features/auth/model/SessionUserContext';
import { MembersScreen } from '../../src/features/membros/ui/MembersScreen';

export default function MembersRoute() {
  return <MembersScreen user={useSessionUser()} />;
}
