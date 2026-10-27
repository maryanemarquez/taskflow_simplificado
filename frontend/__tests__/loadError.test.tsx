import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { ApiRequestError, NetworkRequestError } from '../src/core/api/httpErrors';
import { membrosApi } from '../src/features/membros/api/membrosApi';
import { MembersScreen } from '../src/features/membros/ui/MembersScreen';
import { tarefasApi } from '../src/features/tarefas/api/tarefasApi';
import { TasksScreen } from '../src/features/tarefas/ui/TasksScreen';
import { renderWithClient, OWNER } from './testUtils';

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('../src/features/tarefas/api/tarefasApi', () => ({
  tarefasApi: { list: jest.fn(), create: jest.fn(), update: jest.fn(), changeStatus: jest.fn(), remove: jest.fn() },
}));
jest.mock('../src/features/membros/api/membrosApi', () => ({
  membrosApi: { list: jest.fn(), add: jest.fn(), remove: jest.fn() },
}));

const MEMBERS = [{ id: 1, nome: 'Dono', email: 'dono@taskflow.invalid', papel: 'DONO' as const }];

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(membrosApi.list).mockResolvedValue(MEMBERS);
});

describe('lista de tarefas', () => {
  it('falha ao carregar mostra o erro com "Tentar novamente", não uma lista vazia', async () => {
    jest.mocked(tarefasApi.list).mockRejectedValueOnce(new NetworkRequestError('network')).mockResolvedValue([]);
    renderWithClient(<TasksScreen user={OWNER} />);

    expect(await screen.findByText(/Não foi possível conectar ao servidor/)).toBeTruthy();
    expect(screen.queryByText('Nenhuma tarefa por aqui')).toBeNull();
    expect(screen.queryByText('Nenhuma tarefa.')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Nenhuma tarefa por aqui')).toBeTruthy();
  });

  it('erro do servidor mostra a mensagem da API com o código de suporte', async () => {
    jest
      .mocked(tarefasApi.list)
      .mockRejectedValue(
        new ApiRequestError({ codigo: 'ERRO_INTERNO', mensagem: 'Ocorreu um erro inesperado.' }, { status: 500, requestId: 'req-123' }),
      );
    renderWithClient(<TasksScreen user={OWNER} />);

    expect(await screen.findByText('Ocorreu um erro inesperado. (código de suporte: req-123)')).toBeTruthy();
  });

  it('mostra carregando enquanto a lista não responde', () => {
    jest.mocked(tarefasApi.list).mockReturnValue(new Promise(() => undefined));
    renderWithClient(<TasksScreen user={OWNER} />);

    expect(screen.getByText('Carregando…')).toBeTruthy();
    expect(screen.queryByText('Nenhuma tarefa.')).toBeNull();
  });
});

describe('lista de membros', () => {
  it('falha ao carregar mostra o erro com "Tentar novamente", não "0 pessoas"', async () => {
    jest.mocked(membrosApi.list).mockRejectedValueOnce(new ApiRequestError({ codigo: 'ERRO_INTERNO' }, { status: 500 })).mockResolvedValue(MEMBERS);
    renderWithClient(<MembersScreen user={OWNER} />);

    expect(await screen.findByText('Não foi possível concluir a operação. Tente novamente.')).toBeTruthy();
    expect(screen.queryByText('0 pessoas na equipe')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));

    await waitFor(() => expect(screen.getByText('1 pessoa na equipe')).toBeTruthy());
  });

  it('mostra carregando enquanto a lista não responde', () => {
    jest.mocked(membrosApi.list).mockReturnValue(new Promise(() => undefined));
    renderWithClient(<MembersScreen user={OWNER} />);

    expect(screen.getByText('Carregando…')).toBeTruthy();
  });
});
