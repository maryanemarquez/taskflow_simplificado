import type { CurrentUser } from '../../auth/model/authTypes';
import type { Task, TaskStatus } from '../api/tarefasApi';

export const STATUS_ORDER: TaskStatus[] = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'];

/** Estágio vizinho no fluxo (+1 avança, -1 retrocede), ou null no limite. */
export function neighborStatus(status: TaskStatus, step: 1 | -1): TaskStatus | null {
  return STATUS_ORDER[STATUS_ORDER.indexOf(status) + step] ?? null;
}

export function isOwner(user: CurrentUser): boolean {
  return user.equipe?.papel === 'DONO';
}

/** O Dono mexe em qualquer tarefa; o Membro só nas que é responsável. */
export function canManage(user: CurrentUser, task: Task): boolean {
  return isOwner(user) || task.responsavel.id === user.usuario.id;
}

export type DropResult = 'move' | 'one-step' | 'ignore';

/**
 * Decide o que fazer ao soltar um cartão numa coluna do Kanban:
 * `move` só para a coluna vizinha e se o usuário pode mexer na tarefa (RN-06 e papéis);
 * `one-step` quando tenta pular um estágio; `ignore` para o resto (mesma coluna ou sem permissão).
 */
export function resolveDrop(user: CurrentUser, task: Task, target: TaskStatus): DropResult {
  if (target === task.status || !canManage(user, task)) {
    return 'ignore';
  }
  const isNeighbor = neighborStatus(task.status, 1) === target || neighborStatus(task.status, -1) === target;
  return isNeighbor ? 'move' : 'one-step';
}
