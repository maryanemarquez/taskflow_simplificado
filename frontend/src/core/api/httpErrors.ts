import { MESSAGES } from '../messages/messages';

export interface ApiFieldError {
  campo: string;
  codigo: string;
  mensagem: string;
}

export interface ApiProblem {
  codigo: string;
  mensagem?: string;
  detail?: string;
  erros?: ApiFieldError[];
}

export class ApiRequestError extends Error {
  readonly problem: ApiProblem;

  constructor(problem: ApiProblem) {
    super(problem.mensagem ?? problem.detail ?? MESSAGES.errors.generic);
    this.problem = problem;
  }
}

/** Prefere a mensagem do primeiro campo com erro (ex.: prazo inválido) à mensagem genérica da API. */
export function errorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof ApiRequestError)) {
    return fallback;
  }
  const first = error.problem.erros?.[0];
  const fieldMessage = first ? MESSAGES.fieldErrors[`${first.campo}.${first.codigo}`] : undefined;
  return fieldMessage ?? error.message;
}
