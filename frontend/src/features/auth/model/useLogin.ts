import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { errorMessage } from '../../../core/api/httpErrors';
import { MESSAGES } from '../../../core/messages/messages';
import { session } from '../../../core/session/session';
import { authApi } from '../api/authApi';
import type { LoginPayload } from './authTypes';

const HOME_ROUTE = '/';

export function useLogin() {
  const [form, setForm] = useState<LoginPayload>({ email: '', senha: '' });
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof authApi.login>[0]) => authApi.login(input),
    onSuccess: (response) => {
      queryClient.clear();
      session.setToken(response.accessToken);
      router.replace(HOME_ROUTE);
    },
  });

  const updateField = (field: keyof LoginPayload, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = () => mutation.mutate({ email: form.email.trim().toLowerCase(), senha: form.senha });

  // Credencial inválida chega da API (`CREDENCIAIS_INVALIDAS`); falha de rede tem texto próprio.
  const message = mutation.error ? errorMessage(mutation.error, MESSAGES.errors.generic) : null;
  return { form, updateField, submit, isSubmitting: mutation.isPending, errorMessage: message };
}
