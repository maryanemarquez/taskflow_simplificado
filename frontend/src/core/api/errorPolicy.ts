import type { KnownOrUnknownErrorCode } from './apiContract';
import { ApiRequestError, NetworkRequestError } from './httpErrors';
import { queryClient } from './queryClient';
import { QUERY_KEYS } from './queryKeys';
import { logger, type LogContext } from '../log/logger';
import { session } from '../session/session';

const SERVER_ERROR_STATUS = 500;

export interface RequestInfo {
  method?: string;
  path?: string;
}

/** Erros que indicam que a tela mostra dados já desatualizados: o hook deve recarregar a lista. */
const STALE_DATA_CODES: ReadonlySet<KnownOrUnknownErrorCode> = new Set([
  'TAREFA_NAO_ENCONTRADA',
  'USUARIO_NAO_ENCONTRADO',
  'CONFLITO_CONCORRENCIA',
  'TRANSICAO_STATUS_INVALIDA',
  'SEM_PERMISSAO',
]);

export function isStaleDataError(error: unknown): boolean {
  return error instanceof ApiRequestError && STALE_DATA_CODES.has(error.codigo);
}

function applyApiErrorPolicy(error: ApiRequestError, request: RequestInfo) {
  const context: LogContext = { ...request, requestId: error.requestId, status: error.status, codigo: error.codigo };
  switch (error.codigo) {
    case 'NAO_AUTENTICADO':
      // Só `NAO_AUTENTICADO` encerra a sessão; `CREDENCIAIS_INVALIDAS` (também 401) é erro de login.
      if (session.getToken()) {
        session.clear();
        queryClient.clear();
        logger.warn('SESSAO_EXPIRADA', context);
      }
      break;
    case 'SEM_EQUIPE':
      // `/api/me` informa `equipe: null`; recarregá-lo leva a pessoa à tela "Sem equipe".
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentUser });
      logger.warn('ACESSO_NEGADO', context);
      break;
    case 'SEM_PERMISSAO':
      logger.warn('ACESSO_NEGADO', context);
      break;
    default:
      if ((error.status ?? 0) >= SERVER_ERROR_STATUS) {
        logger.error('API_ERRO_SERVIDOR', context);
      }
  }
}

/** Efeitos colaterais de cada tipo de erro (sessão, cache, log); a mensagem para a pessoa fica em `httpErrors`. */
export function applyErrorPolicy(error: ApiRequestError | NetworkRequestError, request: RequestInfo) {
  if (error instanceof NetworkRequestError) {
    logger.warn(error.kind === 'timeout' ? 'API_TIMEOUT' : 'API_REDE', { ...request, requestId: error.requestId });
    return;
  }
  applyApiErrorPolicy(error, request);
}
