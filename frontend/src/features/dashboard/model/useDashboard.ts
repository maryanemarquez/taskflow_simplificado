import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

export const DASHBOARD_QUERY_KEY = ['dashboard'] as const;

/** Refaz a consulta ao abrir e ao recuperar o foco (padrão do TanStack Query); mutações a invalidam. */
export function useDashboard() {
  return useQuery({ queryKey: DASHBOARD_QUERY_KEY, queryFn: dashboardApi.get });
}
