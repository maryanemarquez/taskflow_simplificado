import { httpClient } from '../../../core/api/httpClient';

export type TaskStatus = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';

export interface Task {
  id: number;
  titulo: string;
  descricao: string | null;
  status: TaskStatus;
  prazo: string | null;
  responsavel: { id: number; nome: string };
}

export interface TaskInput {
  titulo: string;
  descricao: string | null;
  prazo: string | null;
  responsavelId: number | null;
}

const TASKS_ENDPOINT = '/api/tarefas';

export const tarefasApi = {
  async list(): Promise<Task[]> {
    const response = await httpClient.get<Task[]>(TASKS_ENDPOINT);
    return response.data;
  },
  async create(input: TaskInput): Promise<Task> {
    const response = await httpClient.post<Task>(TASKS_ENDPOINT, input);
    return response.data;
  },
  async update(id: number, input: TaskInput): Promise<Task> {
    const response = await httpClient.put<Task>(`${TASKS_ENDPOINT}/${id}`, input);
    return response.data;
  },
  async changeStatus(id: number, status: TaskStatus): Promise<Task> {
    const response = await httpClient.patch<Task>(`${TASKS_ENDPOINT}/${id}/status`, { status });
    return response.data;
  },
  async remove(id: number): Promise<void> {
    await httpClient.delete(`${TASKS_ENDPOINT}/${id}`);
  },
};
