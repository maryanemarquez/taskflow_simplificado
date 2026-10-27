import { useState } from 'react';
import { safeStorage } from '../../../core/storage/safeStorage';

export type TaskView = 'LIST' | 'KANBAN';

const STORAGE_KEY = 'taskflow.tasks.view';

function readStoredView(): TaskView {
  return safeStorage.get(STORAGE_KEY) === 'KANBAN' ? 'KANBAN' : 'LIST';
}

/** Visão escolhida (Lista ou Kanban), lembrada no navegador; sem armazenamento, volta para Lista. */
export function useTaskView() {
  const [view, setViewState] = useState<TaskView>(readStoredView);
  const setView = (next: TaskView) => {
    setViewState(next);
    safeStorage.set(STORAGE_KEY, next);
  };
  return { view, setView };
}
