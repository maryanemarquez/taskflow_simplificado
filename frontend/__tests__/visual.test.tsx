import { act, fireEvent, renderHook, screen, waitFor } from '@testing-library/react-native';
import { AppShell } from '../src/features/shell/ui/AppShell';
import { tarefasApi, type Task } from '../src/features/tarefas/api/tarefasApi';
import { membrosApi } from '../src/features/membros/api/membrosApi';
import { resolveDrop } from '../src/features/tarefas/model/taskRules';
import { useKanbanDrag } from '../src/features/tarefas/model/useKanbanDrag';
import { addMonths, isPast, monthMatrix, parseSegments, todayYmd } from '../src/features/tarefas/model/calendar';
import { MembersScreen } from '../src/features/membros/ui/MembersScreen';
import { TasksScreen } from '../src/features/tarefas/ui/TasksScreen';
import { Text } from 'react-native';
import { renderWithClient, MEMBER, OWNER } from './testUtils';

const MESSAGES_MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
let mockMobile = false;
jest.mock('../src/core/theme/useViewport', () => ({
  useViewport: () => ({ width: mockMobile ? 400 : 1200, isMobile: mockMobile }),
}));
jest.mock('expo-router', () => ({ router: { replace: jest.fn() }, usePathname: () => '/tarefas' }));
jest.mock('../src/features/tarefas/api/tarefasApi', () => ({
  tarefasApi: { list: jest.fn(), create: jest.fn(), update: jest.fn(), changeStatus: jest.fn(), remove: jest.fn() },
}));
jest.mock('../src/features/membros/api/membrosApi', () => ({
  membrosApi: { list: jest.fn(), add: jest.fn(), remove: jest.fn() },
}));

const task = (id: number, status: Task['status'], responsavelId: number): Task => ({
  id,
  titulo: `Tarefa ${id}`,
  descricao: null,
  status,
  prazo: null,
  responsavel: { id: responsavelId, nome: responsavelId === 1 ? 'Dono' : 'Bia' },
});

const TASKS = [task(1, 'PENDENTE', 1), task(2, 'EM_ANDAMENTO', 2), task(3, 'CONCLUIDA', 2)];

beforeEach(() => {
  jest.resetAllMocks();
  mockMobile = false;
  globalThis.localStorage.clear();
  jest.mocked(tarefasApi.list).mockResolvedValue(TASKS);
  jest.mocked(membrosApi.list).mockResolvedValue([]);
});

it('HIST-001-visual/C01 - menu lateral com Dashboard, Tarefas, Membros e Sair', () => {
  renderWithClient(<AppShell user={OWNER}><Text>conteúdo</Text></AppShell>);
  for (const nome of ['Dashboard', 'Tarefas', 'Membros', 'Sair']) {
    expect(screen.getByRole('button', { name: nome })).toBeTruthy();
  }
});

it('HIST-001-visual/C01 - no celular o menu abre pelo botão', () => {
  mockMobile = true;
  renderWithClient(<AppShell user={OWNER}><Text>conteúdo</Text></AppShell>);
  expect(screen.queryByRole('button', { name: 'Membros' })).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Abrir menu' }));
  expect(screen.getByRole('button', { name: 'Membros' })).toBeTruthy();
});

it('HIST-001-visual/C02 - topo mostra nome e papel', () => {
  renderWithClient(<AppShell user={MEMBER}><Text>conteúdo</Text></AppShell>);
  expect(screen.getByText('Bia')).toBeTruthy();
  expect(screen.getByText('Membro')).toBeTruthy();
});

it('HIST-001-visual/C03 e C04 - alterna para Kanban e lembra a escolha', async () => {
  const { unmount } = renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Tarefa 1');
  fireEvent.press(screen.getByRole('button', { name: 'Kanban' }));
  for (const coluna of ['Pendente', 'Em andamento', 'Concluída']) {
    expect(screen.getByText(coluna)).toBeTruthy();
  }
  unmount();

  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Tarefa 1');
  expect(screen.getByRole('button', { name: 'Kanban' }).props.accessibilityState).toEqual(expect.objectContaining({ selected: true }));
});

it('HIST-001-visual/C05 - estado vazio com botão Nova tarefa', async () => {
  jest.mocked(tarefasApi.list).mockResolvedValue([]);
  renderWithClient(<TasksScreen user={OWNER} />);
  expect(await screen.findByText('Nenhuma tarefa por aqui')).toBeTruthy();
  expect(screen.getAllByRole('button', { name: 'Nova tarefa' }).length).toBeGreaterThan(0);
});

it('HIST-001-visual/C06 - Nova tarefa abre e fecha a janela modal', async () => {
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Tarefa 1');
  fireEvent.press(screen.getByRole('button', { name: 'Nova tarefa' }));
  expect(screen.getByText('Criar nova tarefa')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
  await waitFor(() => expect(screen.queryByText('Criar nova tarefa')).toBeNull());
});

it('HIST-001-visual/C07 - soltar na coluna vizinha pede a mudança de status', () => {
  const onMove = jest.fn();
  const { result } = renderHook(() => useKanbanDrag(TASKS, OWNER, onMove));
  act(() => result.current.startDrag(1));
  act(() => result.current.dropOn('EM_ANDAMENTO'));
  expect(onMove).toHaveBeenCalledWith(1, 'EM_ANDAMENTO');
  expect(result.current.draggingId).toBeNull();
});

it('HIST-001-visual/C08 - soltar em coluna não vizinha não altera e avisa', () => {
  const onMove = jest.fn();
  const { result } = renderHook(() => useKanbanDrag(TASKS, OWNER, onMove));
  act(() => result.current.startDrag(1));
  act(() => result.current.dropOn('CONCLUIDA'));
  expect(onMove).not.toHaveBeenCalled();
  expect(result.current.hint).toBe('Mova a tarefa um estágio por vez.');
});

it('HIST-001-visual/C09 - Membro não move tarefa de outra pessoa', () => {
  expect(resolveDrop(MEMBER, TASKS[0], 'EM_ANDAMENTO')).toBe('ignore');
  expect(resolveDrop(MEMBER, TASKS[1], 'CONCLUIDA')).toBe('move');
  expect(resolveDrop(OWNER, TASKS[1], 'EM_ANDAMENTO')).toBe('ignore');
});

it('HIST-001-visual/C11 - Membros mostra contagem, papéis e o bloco de adicionar só ao Dono', async () => {
  jest.mocked(membrosApi.list).mockResolvedValue([
    { id: 1, nome: 'Dono', email: 'dono@taskflow.invalid', papel: 'DONO' },
    { id: 2, nome: 'Bia', email: 'bia@taskflow.invalid', papel: 'MEMBRO' },
  ]);
  const { unmount } = renderWithClient(<MembersScreen user={OWNER} />);
  expect(await screen.findByText('2 pessoas na equipe')).toBeTruthy();
  expect(screen.getByText('Adicionar à equipe')).toBeTruthy();
  unmount();

  renderWithClient(<MembersScreen user={MEMBER} />);
  await screen.findByText('2 pessoas na equipe');
  expect(screen.queryByText('Adicionar à equipe')).toBeNull();
});

it('HIST-001-visual/C03 - Lista mostra uma tarefa por linha, agrupada por status e na ordem do fluxo', async () => {
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Tarefa 1');

  const texto = JSON.stringify(screen.toJSON());
  const posicoes = ['Pendente', 'Tarefa 1', 'Em andamento', 'Tarefa 2', 'Concluída', 'Tarefa 3'].map((item) => texto.indexOf(item));
  expect(posicoes.every((pos) => pos >= 0)).toBe(true);
  expect([...posicoes].sort((a, b) => a - b)).toEqual(posicoes);
});

const openNewTaskDate = async () => {
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Tarefa 1');
  fireEvent.press(screen.getByRole('button', { name: 'Nova tarefa' }));
  fireEvent.press(screen.getByRole('button', { name: /^Prazo/ }));
};

const typeDate = (day: string, month: string, year: string) => {
  fireEvent.changeText(screen.getByLabelText('Dia'), day);
  fireEvent.changeText(screen.getByLabelText('Mês'), month);
  fireEvent.changeText(screen.getByLabelText('Ano'), year);
};

it('HIST-001-visual/C12 - o prazo começa vazio e o calendário abre pelo campo', async () => {
  await openNewTaskDate();
  expect(screen.getByLabelText('Dia')).toBeTruthy();
  expect(screen.getByLabelText('Mês')).toBeTruthy();
  expect(screen.getByLabelText('Ano')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Mês anterior' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Próximo mês' })).toBeTruthy();
});

it('HIST-001-visual/C13 - escolher um dia no calendário preenche o prazo e fecha', async () => {
  await openNewTaskDate();
  typeDate('15', '03', '2099');
  fireEvent.press(screen.getByRole('button', { name: '20 de março de 2099' }));

  await waitFor(() => expect(screen.queryByLabelText('Dia')).toBeNull());
  expect(screen.getByRole('button', { name: 'Prazo: 20/03/2099' })).toBeTruthy();
});

it('HIST-001-visual/C14 - data passada digitada não é aceita', async () => {
  await openNewTaskDate();
  typeDate('01', '01', '2020');

  expect(await screen.findByText('Não é possível escolher uma data passada.')).toBeTruthy();
  fireEvent(screen.getByLabelText('Ano'), 'submitEditing');
  expect(screen.getByLabelText('Dia')).toBeTruthy();
});

it('HIST-001-visual/C14 - dias passados ficam desabilitados no calendário', async () => {
  await openNewTaskDate();
  const today = todayYmd();
  // No mês atual não há mês anterior a escolher.
  expect(screen.getByRole('button', { name: 'Mês anterior' }).props.accessibilityState.disabled).toBe(true);
  if (today.day > 1) {
    const first = MESSAGES_MONTHS[today.month - 1].toLowerCase();
    expect(screen.getByRole('button', { name: `1 de ${first} de ${today.year}` }).props.accessibilityState.disabled).toBe(true);
  }
  typeDate('15', '03', '2099');
  expect(screen.getByRole('button', { name: '20 de março de 2099' }).props.accessibilityState.disabled).toBe(false);
  expect(screen.getByRole('button', { name: 'Mês anterior' }).props.accessibilityState.disabled).toBe(false);
});

it('HIST-001-visual/C15 - o × remove o prazo', async () => {
  await openNewTaskDate();
  typeDate('15', '03', '2099');
  fireEvent(screen.getByLabelText('Ano'), 'submitEditing');
  fireEvent.press(screen.getByRole('button', { name: 'Remover prazo' }));

  expect(screen.getByRole('button', { name: 'Prazo: Selecionar data' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Remover prazo' })).toBeNull();
});

it('HIST-001-visual/C16 - prazo já vencido de tarefa existente pode ser mantido', async () => {
  jest.mocked(tarefasApi.list).mockResolvedValue([{ ...TASKS[0], prazo: '2020-01-01' }]);
  jest.mocked(tarefasApi.update).mockResolvedValue(TASKS[0]);
  renderWithClient(<TasksScreen user={OWNER} />);
  await screen.findByText('Tarefa 1');

  fireEvent.press(screen.getByRole('button', { name: 'Editar' }));
  expect(screen.getByRole('button', { name: 'Prazo: 01/01/2020' })).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));

  await waitFor(() => expect(tarefasApi.update).toHaveBeenCalledWith(1, expect.objectContaining({ prazo: '2020-01-01' })));
});

it('HIST-001-visual/C12 - funções do calendário', () => {
  expect(parseSegments('31', '02', '2099')).toBeNull();
  expect(parseSegments('29', '02', '2096')).toEqual({ year: 2096, month: 2, day: 29 });
  expect(parseSegments('1', '02', '2099')).toBeNull();
  expect(addMonths({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
  expect(addMonths({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
  const matrix = monthMatrix({ year: 2026, month: 10 });
  expect(matrix).toHaveLength(6);
  expect(matrix[0]).toHaveLength(7);
  expect(matrix[0][4].date).toEqual({ year: 2026, month: 10, day: 1 });
  expect(isPast({ year: 2026, month: 10, day: 24 }, { year: 2026, month: 10, day: 25 })).toBe(true);
  expect(isPast({ year: 2026, month: 10, day: 25 }, { year: 2026, month: 10, day: 25 })).toBe(false);
});
