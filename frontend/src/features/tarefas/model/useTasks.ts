import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isStaleDataError } from '../../../core/api/errorPolicy';
import { errorMessage } from '../../../core/api/httpErrors';
import { QUERY_KEYS } from '../../../core/api/queryKeys';
import { MESSAGES } from '../../../core/messages/messages';
import { tarefasApi, type TaskInput, type TaskStatus } from '../api/tarefasApi';

export function useTasks() {
  return useQuery({ queryKey: QUERY_KEYS.tasks, queryFn: tarefasApi.list });
}

/**
 * Ações sobre tarefas. `onDone` roda só após criar ou editar (fecha o formulário).
 * Enquanto uma ação está em andamento, repetir o mesmo pedido é ignorado: o clique duplo não duplica a tarefa
 * nem pede duas vezes a mesma troca de status (a segunda daria `TRANSICAO_STATUS_INVALIDA`).
 */
export function useTaskActions(onDone: () => void) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

  const reload = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
  };
  const onChanged = () => {
    setMessage(null);
    reload();
  };
  const onError = (error: unknown) => {
    setMessage(errorMessage(error, MESSAGES.errors.generic));
    // Tarefa removida ou alterada por outra pessoa: a tela mostra dados velhos, então recarrega a lista.
    if (isStaleDataError(error)) {
      reload();
    }
  };

  const create = useMutation({
    mutationFn: (input: TaskInput) => tarefasApi.create(input),
    onSuccess: () => {
      onChanged();
      onDone();
    },
    onError,
  });
  const update = useMutation({
    mutationFn: (args: { id: number; input: TaskInput }) => tarefasApi.update(args.id, args.input),
    onSuccess: () => {
      onChanged();
      onDone();
    },
    onError,
  });
  const status = useMutation({
    mutationFn: (args: { id: number; status: TaskStatus }) => tarefasApi.changeStatus(args.id, args.status),
    onSuccess: onChanged,
    onError,
  });
  const remove = useMutation({ mutationFn: (id: number) => tarefasApi.remove(id), onSuccess: onChanged, onError });

  const isSaving = create.isPending || update.isPending;
  // Tarefa com troca de status ou remoção em andamento: a tela desabilita as ações dela.
  const isTaskBusy = (id: number) =>
    (status.isPending && status.variables?.id === id) || (remove.isPending && remove.variables === id);

  return {
    message,
    clearMessage: () => setMessage(null),
    isSaving,
    isTaskBusy,
    create: (input: TaskInput) => {
      if (!isSaving) {
        create.mutate(input);
      }
    },
    update: (id: number, input: TaskInput) => {
      if (!isSaving) {
        update.mutate({ id, input });
      }
    },
    changeStatus: (id: number, next: TaskStatus) => {
      if (!isTaskBusy(id)) {
        status.mutate({ id, status: next });
      }
    },
    remove: (id: number) => {
      if (!isTaskBusy(id)) {
        remove.mutate(id);
      }
    },
  };
}
