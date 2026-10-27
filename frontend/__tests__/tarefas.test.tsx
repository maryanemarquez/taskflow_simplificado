import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { ApiRequestError } from '../src/core/api/httpErrors';
import { membrosApi } from '../src/features/membros/api/membrosApi';
import { tarefasApi, type Task } from '../src/features/tarefas/api/tarefasApi';
import { TasksScreen } from '../src/features/tarefas/ui/TasksScreen';
import { renderWithClient, MEMBER, OWNER } from './testUtils';

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('../src/features/tarefas/api/tarefasApi', () => ({
  tarefasApi: { list: jest.fn(), create: jest.fn(), update: jest.fn(), changeStatus: jest.fn(), remove: jest.fn() },
}));
jest.mock('../src/features/membros/api/membrosApi', () => ({
  membrosApi: { list: jest.fn(), add: jest.fn(), remove: jest.fn() },
}));

const task = (id: number, titulo: string, status: Task['status'], responsavelId: number): Task => ({
  id,
  titulo,
  descricao: null,
  status,
  prazo: id === 1 ? '2026-12-31' : null,
  responsavel: { id: responsavelId, nome: responsavelId === 1 ? 'Dono' : 'Bia' },
});

const TASKS = [
  task(1, 'Do dono', 'PENDENTE', 1),
  task(2, 'Da Bia', 'EM_ANDAMENTO', 2),
  task(3, 'Pronta', 'CONCLUIDA', 2),
];

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(tarefasApi.list).mockResolvedValue(TASKS);
  jest.mocked(membrosApi.list).mockResolvedValue([
    { id: 1, nome: 'Dono', email: 'dono@taskflow.invalid', papel: 'DONO' },
    { id: 2, nome: 'Bia', email: 'bia@taskflow.invalid', papel: 'MEMBRO' },
  ]);
});

it('HIST-001-tarefa/C12 - mostra os três grupos de status com as tarefas', async () => {
  renderWithClient(<TasksScreen user={OWNER} />);

  expect(await screen.findByText('Do dono')).toBeTruthy();
  for (const grupo of ['Pendente', 'Em andamento', 'Concluída']) {
    expect(screen.getByText(grupo)).toBeTruthy();
  }
  expect(screen.getByText('Prazo: 31/12/2026')).toBeTruthy();
  expect(screen.getByText('Pronta')).toBeTruthy();
});

it('HIST-001-tarefa/C12 - só o Dono vê "Remover"', async () => {
  const { unmount } = renderWithClient(<TasksScreen user={MEMBER} />);
  await screen.findByText('Do dono');
  expect(screen.queryByRole('button', { name: 'Remover' })).toBeNull();
  unmount();

  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Do dono');
  expect(screen.getAllByRole('button', { name: 'Remover' })).toHaveLength(3);
});

it('HIST-001-tarefa/C12 - Membro cria tarefa sem escolher o responsável', async () => {
  jest.mocked(tarefasApi.create).mockResolvedValue(TASKS[1]);
  renderWithClient(<TasksScreen user={MEMBER} />);
  await screen.findByText('Do dono');

  fireEvent.press(screen.getByRole('button', { name: 'Nova tarefa' }));
  expect(screen.queryByText('Responsável')).toBeNull();
  fireEvent.changeText(screen.getByLabelText('Título'), '  Escrever relatório ');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));

  await waitFor(() =>
    expect(tarefasApi.create).toHaveBeenCalledWith({
      titulo: 'Escrever relatório',
      descricao: null,
      prazo: null,
      responsavelId: null,
    }),
  );
});

it('HIST-001-tarefa/C02 - Dono escolhe o responsável ao criar', async () => {
  jest.mocked(tarefasApi.create).mockResolvedValue(TASKS[1]);
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Do dono');

  fireEvent.press(screen.getByRole('button', { name: 'Nova tarefa' }));
  fireEvent.changeText(screen.getByLabelText('Título'), 'Revisar');
  fireEvent.press(await screen.findByRole('button', { name: 'Bia' }));
  fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));

  await waitFor(() => expect(tarefasApi.create).toHaveBeenCalledWith(expect.objectContaining({ responsavelId: 2 })));
});

it('HIST-001-tarefa/C06 - título vazio não é enviado', async () => {
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Do dono');

  fireEvent.press(screen.getByRole('button', { name: 'Nova tarefa' }));
  fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));

  expect(await screen.findByText('Informe o título.')).toBeTruthy();
  expect(tarefasApi.create).not.toHaveBeenCalled();
});

it('HIST-001-tarefa/C08 - Membro edita só a própria tarefa', async () => {
  jest.mocked(tarefasApi.update).mockResolvedValue(TASKS[1]);
  renderWithClient(<TasksScreen user={MEMBER} />);
  await screen.findByText('Da Bia');

  expect(screen.getAllByRole('button', { name: 'Editar' })).toHaveLength(2);
  fireEvent.press(screen.getAllByRole('button', { name: 'Editar' })[0]);
  fireEvent.changeText(screen.getByLabelText('Título'), 'Da Bia editada');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));

  await waitFor(() => expect(tarefasApi.update).toHaveBeenCalledWith(2, expect.objectContaining({ titulo: 'Da Bia editada' })));
});

it('HIST-001-tarefa/C10 - Dono remove uma tarefa', async () => {
  jest.mocked(tarefasApi.remove).mockResolvedValue(undefined);
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Do dono');

  fireEvent.press(screen.getAllByRole('button', { name: 'Remover' })[0]);

  await waitFor(() => expect(tarefasApi.remove).toHaveBeenCalledWith(1));
});

it('HIST-002-tarefa/C08 - botões de status só aparecem quando a ação é possível e permitida', async () => {
  renderWithClient(<TasksScreen user={MEMBER} />);
  await screen.findByText('Da Bia');

  // Bia: "Da Bia" (meio: avança e volta) e "Pronta" (só volta). "Do dono" não é dela: sem botões.
  expect(screen.getAllByRole('button', { name: 'Avançar' })).toHaveLength(1);
  expect(screen.getAllByRole('button', { name: 'Voltar' })).toHaveLength(2);
});

it('HIST-002-tarefa/C01 - Avançar envia o estágio seguinte', async () => {
  jest.mocked(tarefasApi.changeStatus).mockResolvedValue(TASKS[1]);
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Do dono');

  fireEvent.press(screen.getAllByRole('button', { name: 'Avançar' })[0]);

  await waitFor(() => expect(tarefasApi.changeStatus).toHaveBeenCalledWith(1, 'EM_ANDAMENTO'));
});

it('HIST-002-tarefa/C02 - Voltar envia o estágio anterior', async () => {
  jest.mocked(tarefasApi.changeStatus).mockResolvedValue(TASKS[1]);
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Pronta');

  fireEvent.press(screen.getAllByRole('button', { name: 'Voltar' })[1]);

  await waitFor(() => expect(tarefasApi.changeStatus).toHaveBeenCalledWith(3, 'EM_ANDAMENTO'));
});

const typeDate = (day: string, month: string, year: string) => {
  fireEvent.changeText(screen.getByLabelText('Dia'), day);
  fireEvent.changeText(screen.getByLabelText('Mês'), month);
  fireEvent.changeText(screen.getByLabelText('Ano'), year);
};

it('HIST-001-tarefa/C13 - prazo digitado em dia, mês e ano é enviado como AAAA-MM-DD', async () => {
  jest.mocked(tarefasApi.create).mockResolvedValue(TASKS[1]);
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Do dono');

  fireEvent.press(screen.getByRole('button', { name: 'Nova tarefa' }));
  fireEvent.changeText(screen.getByLabelText('Título'), 'Revisar');
  fireEvent.press(screen.getByRole('button', { name: /^Prazo/ }));
  typeDate('30', '11', '2099');
  fireEvent(screen.getByLabelText('Ano'), 'submitEditing');
  expect(screen.getByRole('button', { name: 'Prazo: 30/11/2099' })).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));

  await waitFor(() => expect(tarefasApi.create).toHaveBeenCalledWith(expect.objectContaining({ prazo: '2099-11-30' })));
});

it('HIST-001-tarefa/C13 - prazo com data inexistente não é aceito', async () => {
  jest.mocked(tarefasApi.create).mockResolvedValue(TASKS[1]);
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Do dono');

  fireEvent.press(screen.getByRole('button', { name: 'Nova tarefa' }));
  fireEvent.changeText(screen.getByLabelText('Título'), 'Revisar');
  fireEvent.press(screen.getByRole('button', { name: /^Prazo/ }));
  typeDate('31', '02', '2099');

  expect(await screen.findByText('Prazo inválido. Use uma data real no formato DD/MM/AAAA.')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
  await waitFor(() => expect(tarefasApi.create).toHaveBeenCalledWith(expect.objectContaining({ prazo: null })));
});

it('HIST-001-tarefa/C13 - editar mostra o prazo em DD/MM/AAAA', async () => {
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Do dono');

  fireEvent.press(screen.getAllByRole('button', { name: 'Editar' })[0]);

  expect(screen.getByRole('button', { name: 'Prazo: 31/12/2026' })).toBeTruthy();
});

it('HIST-001-tarefa/C13 - erro do campo prazo vindo da API mostra mensagem clara', async () => {
  const problem = {
    codigo: 'VALIDACAO',
    mensagem: 'Um ou mais campos são inválidos.',
    erros: [{ campo: 'prazo', codigo: 'INVALIDO', mensagem: 'O valor informado é inválido.' }],
  };
  jest.mocked(tarefasApi.create).mockRejectedValue(new ApiRequestError(problem));
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Do dono');

  fireEvent.press(screen.getByRole('button', { name: 'Nova tarefa' }));
  fireEvent.changeText(screen.getByLabelText('Título'), 'Revisar');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));

  expect(await screen.findByText('Prazo inválido. Use uma data real no formato DD/MM/AAAA.')).toBeTruthy();
});

const neverResolves = () => new Promise<never>(() => undefined);

it('FASE2-B1 - clique duplo em "Salvar" cria a tarefa uma só vez', async () => {
  jest.mocked(tarefasApi.create).mockImplementation(neverResolves);
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Do dono');

  fireEvent.press(screen.getByRole('button', { name: 'Nova tarefa' }));
  fireEvent.changeText(screen.getByLabelText('Título'), 'Revisar');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
  fireEvent.press(await screen.findByRole('button', { name: /Enviando/ }));

  await waitFor(() => expect(tarefasApi.create).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('button', { name: 'Cancelar' }).props.accessibilityState.disabled).toBe(true);
});

it('FASE2-B1 - clique duplo em "Avançar" troca o status uma só vez', async () => {
  jest.mocked(tarefasApi.changeStatus).mockImplementation(neverResolves);
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Do dono');

  const advance = screen.getAllByRole('button', { name: 'Avançar' })[0];
  fireEvent.press(advance);
  await waitFor(() => expect(screen.getAllByRole('button', { name: 'Avançar' })[0].props.accessibilityState.disabled).toBe(true));
  fireEvent.press(screen.getAllByRole('button', { name: 'Avançar' })[0]);

  await waitFor(() => expect(tarefasApi.changeStatus).toHaveBeenCalledTimes(1));
});

it('FASE2-B2 - erro do formulário não reaparece na página depois de cancelar', async () => {
  jest.mocked(tarefasApi.create).mockRejectedValue(new ApiRequestError({ codigo: 'ERRO_INTERNO' }));
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Do dono');

  fireEvent.press(screen.getByRole('button', { name: 'Nova tarefa' }));
  fireEvent.changeText(screen.getByLabelText('Título'), 'Revisar');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
  await waitFor(() => expect(tarefasApi.create).toHaveBeenCalled());
  fireEvent.press(await screen.findByRole('button', { name: 'Cancelar' }));

  expect(screen.queryByRole('alert')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Nova tarefa' }));
  expect(screen.queryByRole('alert')).toBeNull();
});

it('FASE2-C10 - tarefa que mudou no servidor recarrega a lista', async () => {
  jest
    .mocked(tarefasApi.changeStatus)
    .mockRejectedValue(new ApiRequestError({ codigo: 'TRANSICAO_STATUS_INVALIDA' }, { status: 409 }));
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Do dono');
  expect(tarefasApi.list).toHaveBeenCalledTimes(1);

  fireEvent.press(screen.getAllByRole('button', { name: 'Avançar' })[0]);

  await waitFor(() => expect(tarefasApi.list).toHaveBeenCalledTimes(2));
});
