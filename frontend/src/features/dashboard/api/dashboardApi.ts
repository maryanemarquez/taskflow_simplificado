import { httpClient } from '../../../core/api/httpClient';
import type { TaskStatus } from '../../tarefas/api/tarefasApi';

export type StatusCounts = Record<TaskStatus, number>;

export interface Dashboard {
  equipe: StatusCounts;
  minhasTarefas: StatusCounts;
}

export const dashboardApi = {
  async get(): Promise<Dashboard> {
    const response = await httpClient.get<Dashboard>('/api/dashboard');
    return response.data;
  },
};
