/** Eventos registrados no front. Segue o catálogo do backend: só ids e metadados, nunca dados pessoais. */
export const LOG_EVENTS = {
  API_ERRO_SERVIDOR: 'Erro do servidor',
  API_REDE: 'Falha de rede',
  API_TIMEOUT: 'Tempo de resposta esgotado',
  SESSAO_EXPIRADA: 'Sessão encerrada pelo servidor',
  ACESSO_NEGADO: 'Acesso negado',
  UI_FALHA_RENDER: 'Falha ao desenhar a tela',
} as const;

export type LogEvent = keyof typeof LOG_EVENTS;

/**
 * Único contexto aceito. Corpo da requisição, headers (token) e e-mail ficam de fora por construção:
 * o tipo não tem onde recebê-los.
 */
export interface LogContext {
  requestId?: string;
  method?: string;
  path?: string;
  status?: number;
  codigo?: string;
}

type Level = 'warn' | 'error';

function emit(level: Level, event: LogEvent, context: LogContext) {
  // Único ponto do app autorizado a usar o console (veja eslint.config.js).
  console[level](`[taskflow] ${LOG_EVENTS[event]}`, { evento: event, ...context });
}

export const logger = {
  warn: (event: LogEvent, context: LogContext = {}) => emit('warn', event, context),
  error: (event: LogEvent, context: LogContext = {}) => emit('error', event, context),
};
