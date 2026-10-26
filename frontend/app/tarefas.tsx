import { Protected } from '../src/core/ui/Protected';
import { TasksScreen } from '../src/features/tarefas/ui/TasksScreen';

export default function TasksRoute() {
  return <Protected>{(user) => <TasksScreen user={user} />}</Protected>;
}
