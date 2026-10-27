import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { errorMessage } from '../../../core/api/httpErrors';
import { QUERY_KEYS } from '../../../core/api/queryKeys';
import { MESSAGES } from '../../../core/messages/messages';
import { tarefasApi, type TaskInput, type TaskStatus } from '../api/tarefasApi';

export function useTasks() {
  return useQuery({ queryKey: QUERY_KEYS.tasks, queryFn: tarefasApi.list });
}

export function useTaskActions(onDone: () => void) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const handlers = {
    onSuccess: () => {
      setMessage(null);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
      onDone();
    },
    onError: (error: unknown) => setMessage(errorMessage(error, MESSAGES.errors.generic)),
  };
  const create = useMutation({ mutationFn: (input: TaskInput) => tarefasApi.create(input), ...handlers });
  const update = useMutation({
    mutationFn: (args: { id: number; input: TaskInput }) => tarefasApi.update(args.id, args.input),
    ...handlers,
  });
  const status = useMutation({
    mutationFn: (args: { id: number; status: TaskStatus }) => tarefasApi.changeStatus(args.id, args.status),
    ...handlers,
  });
  const remove = useMutation({ mutationFn: (id: number) => tarefasApi.remove(id), ...handlers });
  return {
    message,
    create: (input: TaskInput) => create.mutate(input),
    update: (id: number, input: TaskInput) => update.mutate({ id, input }),
    changeStatus: (id: number, next: TaskStatus) => status.mutate({ id, status: next }),
    remove: (id: number) => remove.mutate(id),
  };
}
