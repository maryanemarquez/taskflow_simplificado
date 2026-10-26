import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { errorMessage } from '../../../core/api/httpErrors';
import { MESSAGES } from '../../../core/messages/messages';
import { session } from '../../../core/session/session';
import { authApi } from '../api/authApi';
import type { AccountType, RegistrationForm } from './authTypes';
import { validateRegistration, type RegistrationErrors, type RegistrationField } from './registrationValidation';

const EMPTY_FORM: RegistrationForm = { nome: '', email: '', senha: '', tipo: null };
const HOME_ROUTE = '/';

export function useRegistration() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof authApi.register>[0]) => authApi.register(input),
    onSuccess: (response) => {
      queryClient.clear();
      session.setToken(response.accessToken);
      router.replace(HOME_ROUTE);
    },
  });

  const updateField = (field: Exclude<RegistrationField, 'tipo'>, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const updateType = (tipo: AccountType) => {
    setForm((current) => ({ ...current, tipo }));
    setErrors((current) => ({ ...current, tipo: undefined }));
  };

  const submit = () => {
    const validationErrors = validateRegistration(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0 && form.tipo) {
      mutation.mutate({ ...form, tipo: form.tipo, nome: form.nome.trim(), email: form.email.trim().toLowerCase() });
    }
  };

  const message = mutation.error ? errorMessage(mutation.error, MESSAGES.registration.genericError) : null;
  return { form, errors, updateField, updateType, submit, isSubmitting: mutation.isPending, errorMessage: message };
}
