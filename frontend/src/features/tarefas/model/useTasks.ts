import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActionFeedback } from '../../../core/api/useActionFeedback';
import { invalidateTaskData } from '../../../core/api/invalidation';
import { QUERY_KEYS } from '../../../core/api/queryKeys';
import { tarefasApi, type TaskInput, type TaskStatus } from '../api/tarefasApi';

/** Campos do formulário de tarefa que mostram o erro da API ao lado do próprio campo. */
const TASK_FORM_FIELDS = ['titulo', 'descricao', 'prazo', 'responsavelId'] as const;

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

  const reload = () => invalidateTaskData(queryClient);
  // Tarefa removida ou alterada por outra pessoa: a tela mostra dados velhos, então recarrega a lista.
  const feedback = useActionFeedback({ fields: TASK_FORM_FIELDS, onStale: reload });
  const onChanged = () => {
    feedback.clear();
    reload();
  };
  const onError = (error: unknown) => feedback.handleError(error);

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
    message: feedback.message,
    fieldErrors: feedback.fieldErrors,
    clearMessage: feedback.clear,
    isSaving,
    isTaskBusy,
    create: (input: TaskInput) => {
      if (!isSaving) {
        feedback.clear();
        create.mutate(input);
      }
    },
    update: (id: number, input: TaskInput) => {
      if (!isSaving) {
        feedback.clear();
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
