import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../core/api/queryKeys';
import { dashboardApi } from '../api/dashboardApi';

/** Refaz a consulta ao abrir e ao recuperar o foco (padrão do TanStack Query); mutações a invalidam. */
export function useDashboard() {
  return useQuery({ queryKey: QUERY_KEYS.dashboard, queryFn: dashboardApi.get });
}
