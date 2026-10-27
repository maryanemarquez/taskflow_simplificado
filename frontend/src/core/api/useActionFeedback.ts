import { useState } from 'react';
import { MESSAGES } from '../messages/messages';
import { isStaleDataError } from './errorPolicy';
import { errorMessage, fieldMessages } from './httpErrors';

export type FieldErrors = Record<string, string>;

interface ActionFeedbackOptions {
  /** Campos do formulário que mostram o próprio erro; os demais erros viram uma mensagem única. */
  fields?: readonly string[];
  /** Recarrega os dados quando o erro indica que a tela está desatualizada. */
  onStale: () => void;
}

interface HandleErrorOptions {
  refreshStale?: boolean;
}

/** Retorno de uma ação (criar, editar, remover): mensagem, erros por campo e recarga quando os dados estão velhos. */
export function useActionFeedback({ fields = [], onStale }: ActionFeedbackOptions) {
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clear = () => {
    setMessage(null);
    setFieldErrors({});
  };

  const handleError = (error: unknown, { refreshStale = true }: HandleErrorOptions = {}) => {
    const byField = fieldMessages(error);
    const known = Object.fromEntries(fields.filter((field) => byField[field]).map((field) => [field, byField[field]]));
    if (Object.keys(known).length > 0) {
      setFieldErrors(known);
      setMessage(null);
    } else {
      setFieldErrors({});
      setMessage(errorMessage(error, MESSAGES.errors.generic));
    }
    if (refreshStale && isStaleDataError(error)) {
      onStale();
    }
  };

  return { message, fieldErrors, clear, showMessage: setMessage, handleError };
}
