import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { ApiRequestError } from '../src/core/api/httpErrors';
import { session } from '../src/core/session/session';
import { authApi } from '../src/features/auth/api/authApi';
import { NoTeamScreen } from '../src/features/equipe/ui/NoTeamScreen';
import { membrosApi } from '../src/features/membros/api/membrosApi';
import { MembersScreen } from '../src/features/membros/ui/MembersScreen';
import { renderWithClient, MEMBER, OWNER, WITHOUT_TEAM } from './testUtils';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
  Redirect: ({ href }: { href: string }) => {
    const { Text: MockText } = jest.requireActual('react-native');
    return jest.requireActual('react').createElement(MockText, null, `redirect:${href}`);
  },
}));
jest.mock('../src/features/auth/api/authApi', () => ({ authApi: { currentUser: jest.fn() } }));
jest.mock('../src/features/membros/api/membrosApi', () => ({
  membrosApi: { list: jest.fn(), add: jest.fn(), remove: jest.fn() },
}));

const MEMBERS = [
  { id: 1, nome: 'Dono', email: 'dono@taskflow.invalid', papel: 'DONO' as const },
  { id: 2, nome: 'Bia', email: 'bia@taskflow.invalid', papel: 'MEMBRO' as const },
];

beforeEach(() => {
  jest.resetAllMocks();
  session.setToken('token-teste');
  jest.mocked(membrosApi.list).mockResolvedValue(MEMBERS);
});

it('HIST-001-equipe/C09 - Sem equipe mostra o aviso e só oferece "Sair"', async () => {
  jest.mocked(authApi.currentUser).mockResolvedValue(WITHOUT_TEAM);
  renderWithClient(<NoTeamScreen />);

  expect(await screen.findByText('Você não faz parte de nenhuma equipe')).toBeTruthy();
  expect(await screen.findByText('Seu e-mail: bia@taskflow.invalid')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Tarefas' })).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Sair' }));
  await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/login'));
  expect(session.getToken()).toBeNull();
});

it('HIST-001-equipe/C10 - quem voltou a ter equipe é levado ao Dashboard', async () => {
  jest.mocked(authApi.currentUser).mockResolvedValue(MEMBER);
  renderWithClient(<NoTeamScreen />);

  expect(await screen.findByText('redirect:/dashboard')).toBeTruthy();
});

it('HIST-001-equipe/C01 - Membro vê a lista, sem adicionar nem remover', async () => {
  renderWithClient(<MembersScreen user={MEMBER} />);

  expect(await screen.findByText('dono@taskflow.invalid')).toBeTruthy();
  expect(screen.getByText('bia@taskflow.invalid')).toBeTruthy();
  expect(screen.queryByLabelText('E-mail do membro')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Remover' })).toBeNull();
});

it('HIST-001-equipe/C02 - Dono adiciona um membro pelo e-mail', async () => {
  jest.mocked(membrosApi.add).mockResolvedValue(MEMBERS[1]);
  renderWithClient(<MembersScreen user={OWNER} />);
  await screen.findByText('bia@taskflow.invalid');

  fireEvent.changeText(screen.getByLabelText('E-mail do membro'), ' nova@taskflow.invalid ');
  fireEvent.press(screen.getByRole('button', { name: 'Adicionar' }));

  await waitFor(() => expect(membrosApi.add).toHaveBeenCalledWith('nova@taskflow.invalid'));
});

it('HIST-001-equipe/C03 - e-mail vazio não é enviado', async () => {
  renderWithClient(<MembersScreen user={OWNER} />);
  await screen.findByText('bia@taskflow.invalid');

  fireEvent.press(screen.getByRole('button', { name: 'Adicionar' }));

  expect(await screen.findByText('Informe o e-mail.')).toBeTruthy();
  expect(membrosApi.add).not.toHaveBeenCalled();
});

it('HIST-001-equipe/C06 - Dono remove um membro, mas não o Dono', async () => {
  jest.mocked(membrosApi.remove).mockResolvedValue(undefined);
  renderWithClient(<MembersScreen user={OWNER} />);
  await screen.findByText('bia@taskflow.invalid');

  expect(screen.getAllByRole('button', { name: 'Remover' })).toHaveLength(1);
  fireEvent.press(screen.getByRole('button', { name: 'Remover' }));

  await waitFor(() => expect(membrosApi.remove).toHaveBeenCalledWith(2));
});

it('FASE2-B1 - clique duplo em "Adicionar" envia o convite uma só vez', async () => {
  jest.mocked(membrosApi.add).mockImplementation(() => new Promise<never>(() => undefined));
  renderWithClient(<MembersScreen user={OWNER} />);
  await screen.findByText('bia@taskflow.invalid');

  fireEvent.changeText(screen.getByLabelText('E-mail do membro'), 'nova@taskflow.invalid');
  fireEvent.press(screen.getByRole('button', { name: 'Adicionar' }));
  fireEvent.press(await screen.findByRole('button', { name: /Enviando/ }));

  await waitFor(() => expect(membrosApi.add).toHaveBeenCalledTimes(1));
});

it('FASE2-C10 - remover membro que já saiu recarrega a lista', async () => {
  jest
    .mocked(membrosApi.remove)
    .mockRejectedValue(new ApiRequestError({ codigo: 'USUARIO_NAO_ENCONTRADO' }, { status: 404 }));
  renderWithClient(<MembersScreen user={OWNER} />);
  await screen.findByText('bia@taskflow.invalid');
  expect(membrosApi.list).toHaveBeenCalledTimes(1);

  fireEvent.press(screen.getByRole('button', { name: 'Remover' }));

  await waitFor(() => expect(membrosApi.list).toHaveBeenCalledTimes(2));
});
