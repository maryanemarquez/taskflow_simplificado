import { session } from '../src/core/session/session';
import { sessionNotice } from '../src/core/session/sessionNotice';

const NOW = new Date('2026-10-27T12:00:00Z');
const HOUR = 3_600_000;
const inHours = (hours: number) => new Date(NOW.getTime() + hours * HOUR).toISOString();

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
  localStorage.clear();
  session.clear();
  sessionNotice.clear();
});

afterEach(() => {
  session.clear();
  jest.useRealTimers();
});

describe('expiração do token', () => {
  it('encerra a sessão e marca o aviso quando o token vence', () => {
    session.setToken('token', inHours(8));

    jest.advanceTimersByTime(8 * HOUR - 1);
    expect(session.getToken()).toBe('token');

    jest.advanceTimersByTime(1);
    expect(session.getToken()).toBeNull();
    expect(sessionNotice.isExpired()).toBe(true);
    expect(localStorage.getItem('taskflow-token')).toBeNull();
    expect(localStorage.getItem('taskflow-token-expires-at')).toBeNull();
  });

  it('avisa quem acompanha a sessão', () => {
    const listener = jest.fn();
    const unsubscribe = session.subscribe(listener);
    session.setToken('token', inHours(1));
    listener.mockClear();

    jest.advanceTimersByTime(HOUR);

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('sair antes do vencimento cancela o agendamento e não mostra o aviso', () => {
    session.setToken('token', inHours(1));
    session.clear();

    jest.advanceTimersByTime(2 * HOUR);

    expect(sessionNotice.isExpired()).toBe(false);
  });

  it('um novo login substitui o agendamento do anterior', () => {
    session.setToken('antigo', inHours(1));
    session.setToken('novo', inHours(8));

    jest.advanceTimersByTime(2 * HOUR);

    expect(session.getToken()).toBe('novo');
  });

  it('vencimento já passado encerra a sessão logo em seguida', () => {
    session.setToken('token', inHours(-1));

    jest.advanceTimersByTime(0);

    expect(session.getToken()).toBeNull();
    expect(sessionNotice.isExpired()).toBe(true);
  });

  it('sem vencimento informado, o cliente não encerra a sessão sozinho', () => {
    session.setToken('token');

    jest.advanceTimersByTime(24 * HOUR);

    expect(session.getToken()).toBe('token');
  });

  it('vencimento ilegível é ignorado', () => {
    session.setToken('token', 'não é data');

    jest.advanceTimersByTime(24 * HOUR);

    expect(session.getToken()).toBe('token');
  });
});

describe('sessão guardada ao abrir o app', () => {
  const load = () => {
    let loaded!: { session: typeof session; sessionNotice: typeof sessionNotice };
    jest.isolateModules(() => {
      loaded = {
        session: jest.requireActual<typeof import('../src/core/session/session')>('../src/core/session/session').session,
        sessionNotice: jest.requireActual<typeof import('../src/core/session/sessionNotice')>('../src/core/session/sessionNotice').sessionNotice,
      };
    });
    return loaded;
  };

  it('descarta o token vencido e deixa o aviso', () => {
    localStorage.setItem('taskflow-token', 'velho');
    localStorage.setItem('taskflow-token-expires-at', inHours(-1));

    const loaded = load();

    expect(loaded.session.getToken()).toBeNull();
    expect(loaded.sessionNotice.isExpired()).toBe(true);
    expect(localStorage.getItem('taskflow-token')).toBeNull();
    expect(localStorage.getItem('taskflow-token-expires-at')).toBeNull();
  });

  it('mantém o token válido e agenda o vencimento', () => {
    localStorage.setItem('taskflow-token', 'valido');
    localStorage.setItem('taskflow-token-expires-at', inHours(2));

    const loaded = load();
    expect(loaded.session.getToken()).toBe('valido');

    jest.advanceTimersByTime(2 * HOUR);
    expect(loaded.session.getToken()).toBeNull();
    expect(loaded.sessionNotice.isExpired()).toBe(true);
  });

  it('mantém o token guardado sem vencimento conhecido', () => {
    localStorage.setItem('taskflow-token', 'sem-data');

    expect(load().session.getToken()).toBe('sem-data');
  });
});
