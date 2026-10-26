import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { errorMessage } from '../../../core/api/httpErrors';
import { MESSAGES } from '../../../core/messages/messages';
import { membrosApi } from '../api/membrosApi';

export const MEMBERS_QUERY_KEY = ['members'] as const;
const TASKS_QUERY_KEY = ['tasks'] as const;
const DASHBOARD_QUERY_KEY = ['dashboard'] as const;

export function useMembers() {
  return useQuery({ queryKey: MEMBERS_QUERY_KEY, queryFn: membrosApi.list });
}

export function useMemberActions() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const refresh = () => {
    setMessage(null);
    queryClient.invalidateQueries({ queryKey: MEMBERS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
  };
  const onError = (error: unknown) => setMessage(errorMessage(error, MESSAGES.errors.generic));
  const addMutation = useMutation({
    mutationFn: (email: string) => membrosApi.add(email),
    onSuccess: () => {
      setEmail('');
      refresh();
    },
    onError,
  });
  const removeMutation = useMutation({ mutationFn: (id: number) => membrosApi.remove(id), onSuccess: refresh, onError });

  const add = () => {
    if (!email.trim()) {
      setMessage(MESSAGES.members.emailRequired);
      return;
    }
    addMutation.mutate(email.trim());
  };
  return { email, setEmail, message, add, remove: (id: number) => removeMutation.mutate(id) };
}
