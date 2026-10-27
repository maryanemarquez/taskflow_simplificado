import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ApiRequestError, errorMessage, fieldMessages } from '../../../core/api/httpErrors';
import { MESSAGES } from '../../../core/messages/messages';
import { session } from '../../../core/session/session';
import { authApi } from '../api/authApi';
import type { AccountType, RegistrationForm } from './authTypes';
import { validateRegistration, type RegistrationErrors, type RegistrationField } from './registrationValidation';

const EMPTY_FORM: RegistrationForm = { nome: '', email: '', senha: '', tipo: null };
const HOME_ROUTE = '/';
const FORM_FIELDS: RegistrationField[] = ['nome', 'email', 'senha', 'tipo'];

/** Erros que a API aponta por campo; `EMAIL_JA_CADASTRADO` não traz `erros[]`, mas pertence ao campo e-mail. */
function serverFieldErrors(error: unknown): RegistrationErrors {
  const messages = fieldMessages(error);
  if (error instanceof ApiRequestError && error.codigo === 'EMAIL_JA_CADASTRADO') {
    messages.email = error.message;
  }
  const errors: RegistrationErrors = {};
  for (const field of FORM_FIELDS) {
    if (messages[field]) {
      errors[field] = messages[field];
    }
  }
  return errors;
}

export function useRegistration() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof authApi.register>[0]) => authApi.register(input),
    onSuccess: (response) => {
      queryClient.clear();
      session.setToken(response.accessToken);
      router.replace(HOME_ROUTE);
    },
    onError: (error) => {
      const fieldErrors = serverFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((current) => ({ ...current, ...fieldErrors }));
      } else {
        setBanner(errorMessage(error, MESSAGES.registration.genericError));
      }
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
    setBanner(null);
    if (Object.keys(validationErrors).length === 0 && form.tipo) {
      mutation.mutate({ ...form, tipo: form.tipo, nome: form.nome.trim(), email: form.email.trim().toLowerCase() });
    }
  };

  return { form, errors, updateField, updateType, submit, isSubmitting: mutation.isPending, errorMessage: banner };
}
