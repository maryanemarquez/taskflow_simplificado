import { useState } from 'react';
import { MESSAGES } from '../../../core/messages/messages';
import type { CurrentUser } from '../../auth/model/authTypes';
import type { Task, TaskStatus } from '../api/tarefasApi';
import { resolveDrop } from './taskRules';

/** Estado do arrastar e soltar do Kanban; a mudança de status em si é feita por `onMove`. */
export function useKanbanDrag(
  tasks: Task[],
  user: CurrentUser,
  onMove: (id: number, status: TaskStatus) => void,
) {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const endDrag = () => {
    setDraggingId(null);
    setOverStatus(null);
  };

  return {
    draggingId,
    overStatus,
    hint,
    startDrag: (id: number) => {
      setHint(null);
      setDraggingId(id);
    },
    endDrag,
    hoverOver: (status: TaskStatus | null) => setOverStatus(status),
    dropOn: (status: TaskStatus) => {
      const task = tasks.find((item) => item.id === draggingId);
      endDrag();
      if (!task) {
        return;
      }
      const result = resolveDrop(user, task, status);
      if (result === 'move') {
        onMove(task.id, status);
      } else if (result === 'one-step') {
        setHint(MESSAGES.tasks.dragOneStep);
      }
    },
  };
}
