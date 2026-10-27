import { Slot } from 'expo-router';
import { Protected } from '../../src/features/shell/ui/Protected';

/** Todas as rotas deste grupo exigem sessão e equipe, e aparecem dentro do AppShell. */
export default function AppLayout() {
  return (
    <Protected>
      <Slot />
    </Protected>
  );
}
