import { act, screen } from '@testing-library/react-native';
import { applyErrorPolicy } from '../src/core/api/errorPolicy';
import { ApiRequestError } from '../src/core/api/httpErrors';
import { session } from '../src/core/session/session';
import { sessionNotice } from '../src/core/session/sessionNotice';
import { LoginScreen } from '../src/features/auth/ui/LoginScreen';
import { renderWithClient } from './testUtils';

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('../src/features/auth/api/authApi', () => ({
  authApi: { register: jest.fn(), login: jest.fn(), currentUser: jest.fn() },
}));

const EXPIRED_TEXT = 'Sua sessão expirou. Entre novamente.';

beforeEach(() => {
  jest.resetAllMocks();
  session.clear();
  sessionNotice.clear();
});

describe('aviso de sessão expirada', () => {
  it('NAO_AUTENTICADO com sessão aberta encerra a sessão e marca o aviso', () => {
    session.setToken('token-teste');

    applyErrorPolicy(new ApiRequestError({ codigo: 'NAO_AUTENTICADO' }, { status: 401 }), {});

    expect(session.getToken()).toBeNull();
    expect(sessionNotice.isExpired()).toBe(true);
  });

  it('NAO_AUTENTICADO sem sessão (login recusado antes) não marca o aviso', () => {
    applyErrorPolicy(new ApiRequestError({ codigo: 'NAO_AUTENTICADO' }, { status: 401 }), {});

    expect(sessionNotice.isExpired()).toBe(false);
  });

  it('CREDENCIAIS_INVALIDAS não marca o aviso', () => {
    session.setToken('token-teste');

    applyErrorPolicy(new ApiRequestError({ codigo: 'CREDENCIAIS_INVALIDAS' }, { status: 401 }), {});

    expect(sessionNotice.isExpired()).toBe(false);
  });

  it('o login mostra o aviso e o esconde quando a pessoa entra de novo', () => {
    sessionNotice.markExpired();
    renderWithClient(<LoginScreen />);
    expect(screen.getByText(EXPIRED_TEXT)).toBeTruthy();

    act(() => session.setToken('novo-token'));

    expect(screen.queryByText(EXPIRED_TEXT)).toBeNull();
  });

  it('o login não mostra o aviso quando a sessão não expirou', () => {
    renderWithClient(<LoginScreen />);

    expect(screen.queryByText(EXPIRED_TEXT)).toBeNull();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeTruthy();
  });
});
