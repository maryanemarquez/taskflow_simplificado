import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { dashboardApi, type Dashboard } from '../src/features/dashboard/api/dashboardApi';
import { DashboardScreen } from '../src/features/dashboard/ui/DashboardScreen';
import { renderWithClient } from './testUtils';

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('../src/features/dashboard/api/dashboardApi', () => ({
  dashboardApi: { get: jest.fn() },
}));

const DATA: Dashboard = {
  equipe: { PENDENTE: 4, EM_ANDAMENTO: 2, CONCLUIDA: 7 },
  minhasTarefas: { PENDENTE: 1, EM_ANDAMENTO: 0, CONCLUIDA: 3 },
};

beforeEach(() => {
  jest.resetAllMocks();
});

it('HIST-001-dashboard/C08 - mostra os cartões da equipe e Minhas tarefas, com zero onde não há tarefas', async () => {
  jest.mocked(dashboardApi.get).mockResolvedValue(DATA);
  renderWithClient(<DashboardScreen />);

  expect(await screen.findByText('Equipe')).toBeTruthy();
  expect(screen.getByText('Minhas tarefas')).toBeTruthy();
  expect(screen.getByLabelText('Equipe - Pendente: 4')).toBeTruthy();
  expect(screen.getByLabelText('Equipe - Em andamento: 2')).toBeTruthy();
  expect(screen.getByLabelText('Equipe - Concluída: 7')).toBeTruthy();
  expect(screen.getByLabelText('Minhas tarefas - Pendente: 1')).toBeTruthy();
  expect(screen.getByLabelText('Minhas tarefas - Em andamento: 0')).toBeTruthy();
  expect(screen.getByLabelText('Minhas tarefas - Concluída: 3')).toBeTruthy();
});

it('HIST-001-dashboard/C08 - mostra carregando enquanto a consulta não responde', () => {
  jest.mocked(dashboardApi.get).mockReturnValue(new Promise(() => undefined));
  renderWithClient(<DashboardScreen />);

  expect(screen.getByText('Carregando…')).toBeTruthy();
});

it('HIST-001-dashboard/C08 - mostra erro e permite tentar novamente', async () => {
  jest.mocked(dashboardApi.get).mockRejectedValueOnce(new Error('falha')).mockResolvedValue(DATA);
  renderWithClient(<DashboardScreen />);

  expect(await screen.findByText('Não foi possível carregar o Dashboard.')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));

  await waitFor(() => expect(screen.getByLabelText('Equipe - Pendente: 4')).toBeTruthy());
});
