import React from 'react';
import { Text } from 'react-native';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { session } from '../src/core/session/session';
import { Protected } from '../src/core/ui/Protected';
import { authApi } from '../src/features/auth/api/authApi';
import { renderWithClient, MEMBER, OWNER, WITHOUT_TEAM } from './testUtils';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
  usePathname: () => '/dashboard',
  Redirect: ({ href }: { href: string }) => {
    const { Text: MockText } = jest.requireActual('react-native');
    return jest.requireActual('react').createElement(MockText, null, `redirect:${href}`);
  },
}));
jest.mock('../src/features/auth/api/authApi', () => ({
  authApi: { register: jest.fn(), login: jest.fn(), currentUser: jest.fn() },
}));

const renderProtected = () =>
  renderWithClient(<Protected>{(user) => <Text>{`conteudo de ${user.usuario.nome}`}</Text>}</Protected>);

beforeEach(() => {
  jest.resetAllMocks();
  session.clear();
});

it('HIST-001-auth/C13 - sem sessão, a rota protegida redireciona ao login', async () => {
  renderProtected();

  expect(await screen.findByText('redirect:/login')).toBeTruthy();
  expect(authApi.currentUser).not.toHaveBeenCalled();
});

it('HIST-001-auth/C13 - com sessão e equipe, mostra o conteúdo e o menu', async () => {
  session.setToken('token-teste');
  jest.mocked(authApi.currentUser).mockResolvedValue(MEMBER);
  renderProtected();

  expect(await screen.findByText('conteudo de Bia')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Abrir menu' }));
  expect(screen.getByRole('button', { name: 'Tarefas' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Membros' })).toBeTruthy();
});

it('HIST-001-auth/C13 - "Sair" remove o token e volta ao login', async () => {
  session.setToken('token-teste');
  jest.mocked(authApi.currentUser).mockResolvedValue(OWNER);
  renderProtected();
  await screen.findByText('conteudo de Dono');

  fireEvent.press(screen.getByRole('button', { name: 'Sair' }));

  await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/login'));
  expect(session.getToken()).toBeNull();
});

it('HIST-001-equipe/C09 - usuário sem equipe é levado à tela Sem equipe', async () => {
  session.setToken('token-teste');
  jest.mocked(authApi.currentUser).mockResolvedValue(WITHOUT_TEAM);
  renderProtected();

  expect(await screen.findByText('redirect:/sem-equipe')).toBeTruthy();
});
