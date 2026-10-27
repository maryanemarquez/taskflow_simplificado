import { QueryClient } from '@tanstack/react-query';
import { NetworkRequestError } from './httpErrors';

const MAX_QUERY_RETRIES = 1;

/** Consulta (GET) que falhou por falta de conexão tenta uma vez a mais; erro da API e tempo esgotado não se repetem. */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  return error instanceof NetworkRequestError && error.kind === 'network' && failureCount < MAX_QUERY_RETRIES;
}

/** Cliente único do app; a política de erros da API o usa para invalidar dados fora dos componentes. */
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: shouldRetryQuery }, mutations: { retry: false } },
});
