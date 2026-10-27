import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isStaleDataError } from '../../../core/api/errorPolicy';
import { errorMessage } from '../../../core/api/httpErrors';
import { QUERY_KEYS } from '../../../core/api/queryKeys';
import { MESSAGES } from '../../../core/messages/messages';
import { membrosApi } from '../api/membrosApi';

export function useMembers() {
  return useQuery({ queryKey: QUERY_KEYS.members, queryFn: membrosApi.list });
}

/** Adicionar e remover membros. Enquanto uma ação está em andamento, repeti-la é ignorado (clique duplo). */
export function useMemberActions() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  // Remover um membro reatribui as tarefas dele ao Dono: membros, tarefas e dashboard mudam juntos.
  const reload = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.members });
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
  };
  const onChanged = () => {
    setMessage(null);
    reload();
  };
  const showError = (error: unknown) => setMessage(errorMessage(error, MESSAGES.errors.generic));

  const addMutation = useMutation({
    mutationFn: (value: string) => membrosApi.add(value),
    onSuccess: () => {
      setEmail('');
      onChanged();
    },
    onError: showError,
  });
  const removeMutation = useMutation({
    mutationFn: (id: number) => membrosApi.remove(id),
    onSuccess: onChanged,
    onError: (error) => {
      showError(error);
      // Membro já removido por outra pessoa, ou permissão alterada: a lista na tela está velha.
      if (isStaleDataError(error)) {
        reload();
      }
    },
  });

  const isAdding = addMutation.isPending;
  const removingId = removeMutation.isPending ? (removeMutation.variables ?? null) : null;

  const add = () => {
    if (isAdding) {
      return;
    }
    if (!email.trim()) {
      setMessage(MESSAGES.members.emailRequired);
      return;
    }
    addMutation.mutate(email.trim());
  };
  const remove = (id: number) => {
    if (removingId === null) {
      removeMutation.mutate(id);
    }
  };
  return { email, setEmail, message, isAdding, removingId, add, remove };
}
