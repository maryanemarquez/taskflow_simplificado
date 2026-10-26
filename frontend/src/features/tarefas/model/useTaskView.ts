import { useState } from 'react';

export type TaskView = 'LIST' | 'KANBAN';

const STORAGE_KEY = 'taskflow.tasks.view';

function readStoredView(): TaskView {
  try {
    return globalThis.localStorage?.getItem(STORAGE_KEY) === 'KANBAN' ? 'KANBAN' : 'LIST';
  } catch {
    return 'LIST';
  }
}

/** Visão escolhida (Lista ou Kanban), lembrada no navegador; sem armazenamento, volta para Lista. */
export function useTaskView() {
  const [view, setViewState] = useState<TaskView>(readStoredView);
  const setView = (next: TaskView) => {
    setViewState(next);
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, next);
    } catch {
      // sem armazenamento: a escolha vale só nesta sessão
    }
  };
  return { view, setView };
}
