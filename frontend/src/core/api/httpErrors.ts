import { MESSAGES } from '../messages/messages';
import { toErrorCode, type ApiFieldError, type ApiProblem, type KnownOrUnknownErrorCode } from './apiContract';

const SERVER_ERROR_STATUS = 500;

interface ErrorMeta {
  status?: number;
  requestId?: string;
}

/** Erro devolvido pela API (a resposta chegou), com o `codigo` do contrato e o id de correlação. */
export class ApiRequestError extends Error {
  readonly problem: ApiProblem;
  readonly codigo: KnownOrUnknownErrorCode;
  readonly status: number | undefined;
  readonly requestId: string | undefined;

  constructor(problem: ApiProblem, meta: ErrorMeta = {}) {
    super(problem.mensagem ?? problem.detail ?? MESSAGES.errors.generic);
    this.name = 'ApiRequestError';
    this.problem = problem;
    this.codigo = toErrorCode(problem.codigo);
    this.status = meta.status;
    this.requestId = meta.requestId;
  }

  get fieldErrors(): ApiFieldError[] {
    return this.problem.erros ?? [];
  }
}

export type NetworkFailureKind = 'network' | 'timeout';

/** A resposta não chegou: sem conexão, servidor fora do ar ou tempo esgotado. */
export class NetworkRequestError extends Error {
  readonly kind: NetworkFailureKind;
  readonly requestId: string | undefined;

  constructor(kind: NetworkFailureKind, requestId?: string) {
    super(kind === 'timeout' ? MESSAGES.errors.timeout : MESSAGES.errors.network);
    this.name = 'NetworkRequestError';
    this.kind = kind;
    this.requestId = requestId;
  }
}

/** Texto do campo: o da UI quando é mais específico que o da API (que é genérico por código), senão o da API. */
function fieldMessage(field: ApiFieldError): string | undefined {
  return MESSAGES.fieldErrors[`${field.campo}.${field.codigo}`] ?? (field.mensagem || undefined);
}

/** Falha do servidor: anexa o id de correlação, para o suporte achar a requisição nos logs. */
function withSupportCode(text: string, error: ApiRequestError): string {
  const isServerFault = error.codigo === 'ERRO_INTERNO' || (error.status ?? 0) >= SERVER_ERROR_STATUS;
  return isServerFault && error.requestId ? `${text} ${MESSAGES.errors.supportCode(error.requestId)}` : text;
}

/** Mensagem para a pessoa: rede e API têm texto próprio; qualquer outro erro usa o `fallback`. */
export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof NetworkRequestError) {
    return error.message;
  }
  if (!(error instanceof ApiRequestError)) {
    return fallback;
  }
  const first = error.fieldErrors[0];
  return withSupportCode((first && fieldMessage(first)) || error.message, error);
}

/** Mensagens por campo (`campo` -> texto), na ordem de `erros[]`; vazio quando o erro não aponta campos. */
export function fieldMessages(error: unknown): Record<string, string> {
  const messages: Record<string, string> = {};
  if (error instanceof ApiRequestError) {
    for (const field of error.fieldErrors) {
      messages[field.campo] ??= fieldMessage(field) ?? error.message;
    }
  }
  return messages;
}
