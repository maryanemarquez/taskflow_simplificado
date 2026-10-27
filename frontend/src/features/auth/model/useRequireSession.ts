import { errorMessage } from '../../../core/api/httpErrors';
import { MESSAGES } from '../../../core/messages/messages';
import { useToken } from '../../../core/session/session';
import { useCurrentUser } from './authQueries';
import type { CurrentUser } from './authTypes';

/** Situação da sessão para quem protege rotas: cada tela só decide o que mostrar em cada estado. */
export type SessionState =
  | { status: 'anonymous' }
  | { status: 'loading' }
  | { status: 'error'; message: string; retry: () => void }
  | { status: 'no-team'; user: CurrentUser }
  | { status: 'ready'; user: CurrentUser };

/**
 * Só vai ao login quando não há token (a API invalida o token com `NAO_AUTENTICADO`, e a política de erros o limpa).
 * Falha ao carregar `/api/me` sem dados anteriores vira `error`, com nova tentativa, e não parece logout.
 */
export function useRequireSession(): SessionState {
  const token = useToken();
  const { data, error, isError, refetch } = useCurrentUser();
  if (!token) {
    return { status: 'anonymous' };
  }
  if (data) {
    // Com dados já carregados, uma falha ao recarregar (rede instável) não derruba a tela.
    return data.equipe ? { status: 'ready', user: data } : { status: 'no-team', user: data };
  }
  if (isError) {
    return {
      status: 'error',
      message: errorMessage(error, MESSAGES.session.loadError),
      retry: () => {
        void refetch();
      },
    };
  }
  return { status: 'loading' };
}
