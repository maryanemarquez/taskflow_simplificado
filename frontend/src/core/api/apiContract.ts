/** Header de correlação: o cliente envia um id e o backend o devolve em toda resposta, inclusive nas de erro. */
export const REQUEST_ID_HEADER = 'X-Request-Id';

/** Códigos de erro (`codigo`) publicados pelo backend. */
export const API_ERROR_CODES = [
  'VALIDACAO',
  'TRANSICAO_STATUS_INVALIDA',
  'DONO_NAO_PODE_SER_REMOVIDO',
  'ROTA_NAO_ENCONTRADA',
  'METODO_NAO_PERMITIDO',
  'TIPO_CONTEUDO_NAO_SUPORTADO',
  'NAO_AUTENTICADO',
  'CREDENCIAIS_INVALIDAS',
  'SEM_PERMISSAO',
  'SEM_EQUIPE',
  'USUARIO_NAO_ENCONTRADO',
  'TAREFA_NAO_ENCONTRADA',
  'EMAIL_JA_CADASTRADO',
  'USUARIO_JA_TEM_EQUIPE',
  'CONFLITO_CONCORRENCIA',
  'ERRO_INTERNO',
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

/** Código que o cliente não conhece (resposta sem corpo do contrato ou código novo no backend). */
export const UNKNOWN_ERROR_CODE = 'DESCONHECIDO';
export type KnownOrUnknownErrorCode = ApiErrorCode | typeof UNKNOWN_ERROR_CODE;

/** Falha de um campo (`erros[]`). `codigo` segue como texto para tolerar códigos novos. */
export interface ApiFieldError {
  campo: string;
  codigo: string;
  mensagem: string;
}

/** Corpo de erro (`application/problem+json`): só os campos que o cliente usa. */
export interface ApiProblem {
  codigo: string;
  mensagem?: string;
  detail?: string;
  erros?: ApiFieldError[];
}

export function toErrorCode(value: unknown): KnownOrUnknownErrorCode {
  return API_ERROR_CODES.find((code) => code === value) ?? UNKNOWN_ERROR_CODE;
}

/** Aceita como erro do contrato só um objeto com `codigo` em texto. */
export function isApiProblem(data: unknown): data is ApiProblem {
  return typeof data === 'object' && data !== null && typeof (data as { codigo?: unknown }).codigo === 'string';
}
