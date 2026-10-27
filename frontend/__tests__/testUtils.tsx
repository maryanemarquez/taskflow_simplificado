import type { ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { CurrentUser } from '../src/features/auth/model/authTypes';

export function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

export const OWNER: CurrentUser = {
  usuario: { id: 1, nome: 'Dono', email: 'dono@taskflow.invalid' },
  equipe: { id: 10, nome: 'Equipe de Dono', papel: 'DONO' },
};

export const MEMBER: CurrentUser = {
  usuario: { id: 2, nome: 'Bia', email: 'bia@taskflow.invalid' },
  equipe: { id: 10, nome: 'Equipe de Dono', papel: 'MEMBRO' },
};

export const WITHOUT_TEAM: CurrentUser = { usuario: MEMBER.usuario, equipe: null };
