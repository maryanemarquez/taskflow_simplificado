import { useSessionUser } from '../../src/features/auth/model/SessionUserContext';
import { TasksScreen } from '../../src/features/tarefas/ui/TasksScreen';

export default function TasksRoute() {
  return <TasksScreen user={useSessionUser()} />;
}
