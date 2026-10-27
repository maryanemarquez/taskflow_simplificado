import { QueryClient } from '@tanstack/react-query';

/** Cliente único do app; a política de erros da API o usa para invalidar dados fora dos componentes. */
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});
