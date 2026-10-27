import type { QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from './queryKeys';

/** Após mudar tarefas: recarrega a lista e os números do dashboard. */
export function invalidateTaskData(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
}

/** Após mudar membros: recarrega membros e também tarefas e dashboard, que dependem deles. */
export function invalidateMemberData(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.members });
  invalidateTaskData(queryClient);
}
