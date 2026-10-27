import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invalidateMemberData } from '../../../core/api/invalidation';
import { QUERY_KEYS } from '../../../core/api/queryKeys';
import { useActionFeedback } from '../../../core/api/useActionFeedback';
import { MESSAGES } from '../../../core/messages/messages';
import { membrosApi } from '../api/membrosApi';

export function useMembers() {
  return useQuery({ queryKey: QUERY_KEYS.members, queryFn: membrosApi.list });
}

/** Adicionar e remover membros. Enquanto uma ação está em andamento, repeti-la é ignorado (clique duplo). */
export function useMemberActions() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');

  // Remover um membro reatribui as tarefas dele ao Dono: membros, tarefas e dashboard mudam juntos.
  const reload = () => invalidateMemberData(queryClient);
  const feedback = useActionFeedback({ onStale: reload });
  const onChanged = () => {
    feedback.clear();
    reload();
  };

  const addMutation = useMutation({
    mutationFn: (value: string) => membrosApi.add(value),
    onSuccess: () => {
      setEmail('');
      onChanged();
    },
    // E-mail inexistente ou já em outra equipe: a lista na tela continua válida, não há o que recarregar.
    onError: (error) => feedback.handleError(error, { refreshStale: false }),
  });
  const removeMutation = useMutation({
    mutationFn: (id: number) => membrosApi.remove(id),
    onSuccess: onChanged,
    // Membro já removido por outra pessoa, ou permissão alterada: a lista na tela está velha.
    onError: (error) => feedback.handleError(error),
  });

  const isAdding = addMutation.isPending;
  const removingId = removeMutation.isPending ? (removeMutation.variables ?? null) : null;

  const add = () => {
    if (isAdding) {
      return;
    }
    if (!email.trim()) {
      feedback.showMessage(MESSAGES.members.emailRequired);
      return;
    }
    addMutation.mutate(email.trim());
  };
  const remove = (id: number) => {
    if (removingId === null) {
      removeMutation.mutate(id);
    }
  };
  return { email, setEmail, message: feedback.message, isAdding, removingId, add, remove };
}
