import { FIELD_LIMITS } from '../../../core/api/apiContract';
import { MESSAGES } from '../../../core/messages/messages';

export interface TaskDraft {
  titulo: string;
  descricao: string;
}

export type TaskErrors = Partial<Record<keyof TaskDraft, string>>;

const length = (value: string) => [...value].length;

/** Valida título e descrição antes de enviar, com os mesmos limites do backend. */
export function validateTask({ titulo, descricao }: TaskDraft): TaskErrors {
  const errors: TaskErrors = {};
  const title = titulo.trim();
  if (!title) {
    errors.titulo = MESSAGES.tasks.titleRequired;
  } else if (length(title) > FIELD_LIMITS.titulo) {
    errors.titulo = MESSAGES.tasks.titleTooLong;
  }
  if (length(descricao.trim()) > FIELD_LIMITS.descricao) {
    errors.descricao = MESSAGES.tasks.descriptionTooLong;
  }
  return errors;
}
