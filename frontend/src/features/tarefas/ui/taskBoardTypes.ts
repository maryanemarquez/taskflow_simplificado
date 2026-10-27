import type { Task, TaskStatus } from '../api/tarefasApi';

/** Ações que as visões Lista e Kanban repassam aos cartões. */
export interface TaskBoardActions {
  onEdit: (task: Task) => void;
  onRemove: (id: number) => void;
  onChangeStatus: (id: number, status: TaskStatus) => void;
}

/** Indica à visão quais tarefas têm uma ação em andamento (as ações delas ficam desabilitadas). */
export interface TaskBoardBusy {
  isTaskBusy: (id: number) => boolean;
}
