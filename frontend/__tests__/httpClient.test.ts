import { AxiosError, AxiosHeaders, type AxiosAdapter } from 'axios';
import { REQUEST_ID_HEADER } from '../src/core/api/apiContract';
import { httpClient } from '../src/core/api/httpClient';
import { ApiRequestError, NetworkRequestError } from '../src/core/api/httpErrors';
import { queryClient } from '../src/core/api/queryClient';
import { QUERY_KEYS } from '../src/core/api/queryKeys';
import { logger } from '../src/core/log/logger';
import { session } from '../src/core/session/session';

jest.mock('../src/core/log/logger', () => ({ logger: { warn: jest.fn(), error: jest.fn() } }));

const originalAdapter = httpClient.defaults.adapter;
let sentRequestId: string | undefined;

function remember(config: { headers: AxiosHeaders }) {
  const value = config.headers.get(REQUEST_ID_HEADER);
  sentRequestId = typeof value === 'string' ? value : undefined;
}

/** Simula uma resposta de erro do servidor (status HTTP diferente de 2xx). */
function respondWith(status: number, data: unknown, headers: Record<string, string> = {}) {
  const adapter: AxiosAdapter = (config) => {
    remember(config);
    const response = { data, status, statusText: '', headers: new AxiosHeaders(headers), config };
    return Promise.reject(new AxiosError('falha', AxiosError.ERR_BAD_REQUEST, config, null, response));
  };
  httpClient.defaults.adapter = adapter;
}

/** Simula falha sem resposta (rede fora do ar, tempo esgotado). */
function failWithoutResponse(code: string) {
  const adapter: AxiosAdapter = (config) => {
    remember(config);
    return Promise.reject(new AxiosError('falha', code, config));
  };
  httpClient.defaults.adapter = adapter;
}

function succeed() {
  const adapter: AxiosAdapter = (config) => {
    remember(config);
    return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config });
  };
  httpClient.defaults.adapter = adapter;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  sentRequestId = undefined;
  session.clear();
  queryClient.clear();
});

afterAll(() => {
  httpClient.defaults.adapter = originalAdapter;
});

describe('requisição', () => {
  it('envia o token e um X-Request-Id no formato aceito pelo backend', async () => {
    session.setToken('token-teste');
    let authorization: unknown;
    httpClient.defaults.adapter = (config) => {
      remember(config);
      authorization = config.headers.get('Authorization');
      return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config });
    };

    await httpClient.get('/api/tarefas');

    expect(authorization).toBe('Bearer token-teste');
    expect(sentRequestId).toMatch(/^[A-Za-z0-9-]{1,64}$/);
  });

  it('cada requisição leva um id diferente', async () => {
    succeed();
    await httpClient.get('/api/tarefas');
    const first = sentRequestId;

    await httpClient.get('/api/tarefas');

    expect(sentRequestId).not.toBe(first);
  });
});

describe('erros com resposta da API', () => {
  it('viram ApiRequestError com código, status e o id devolvido pelo servidor', async () => {
    respondWith(
      409,
      { codigo: 'EMAIL_JA_CADASTRADO', mensagem: 'Já existe uma conta com este e-mail.' },
      { 'x-request-id': 'srv-1' },
    );

    const error = await httpClient.post('/api/auth/cadastro', {}).catch((failure: unknown) => failure);

    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toMatchObject({ codigo: 'EMAIL_JA_CADASTRADO', status: 409, requestId: 'srv-1' });
  });

  it('sem o header na resposta, usa o id que o cliente enviou', async () => {
    respondWith(400, { codigo: 'VALIDACAO', mensagem: 'Dados inválidos.' });

    const error = await httpClient.get('/api/tarefas').catch((failure: unknown) => failure);

    expect(sentRequestId).toBeDefined();
    expect(error).toMatchObject({ requestId: sentRequestId });
  });

  it('corpo que não segue o contrato (ex.: HTML de proxy) vira código DESCONHECIDO', async () => {
    respondWith(502, '<html>Bad Gateway</html>');

    const error = await httpClient.get('/api/tarefas').catch((failure: unknown) => failure);

    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toMatchObject({ codigo: 'DESCONHECIDO', status: 502 });
  });

  it('erros do servidor (5xx) são registrados com método, rota e status, sem corpo nem token', async () => {
    session.setToken('token-secreto');
    respondWith(500, { codigo: 'ERRO_INTERNO', mensagem: 'Ocorreu um erro inesperado.' }, { 'x-request-id': 'srv-2' });

    await httpClient.get('/api/tarefas?busca=x').catch(() => undefined);

    expect(logger.error).toHaveBeenCalledWith('API_ERRO_SERVIDOR', {
      method: 'GET',
      path: '/api/tarefas',
      requestId: 'srv-2',
      status: 500,
      codigo: 'ERRO_INTERNO',
    });
    expect(JSON.stringify(jest.mocked(logger.error).mock.calls)).not.toContain('token-secreto');
  });

  it('erros esperados (validação) não são registrados', async () => {
    respondWith(400, { codigo: 'VALIDACAO', mensagem: 'Dados inválidos.' });

    await httpClient.post('/api/tarefas', {}).catch(() => undefined);

    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });
});

describe('erros sem resposta', () => {
  it('falta de conexão vira NetworkRequestError com o id enviado', async () => {
    failWithoutResponse('ERR_NETWORK');

    const error = await httpClient.get('/api/tarefas').catch((failure: unknown) => failure);

    expect(error).toBeInstanceOf(NetworkRequestError);
    expect(error).toMatchObject({ kind: 'network', requestId: sentRequestId });
    expect(logger.warn).toHaveBeenCalledWith('API_REDE', expect.objectContaining({ method: 'GET' }));
  });

  it('tempo esgotado vira NetworkRequestError do tipo timeout', async () => {
    failWithoutResponse('ECONNABORTED');

    const error = await httpClient.get('/api/tarefas').catch((failure: unknown) => failure);

    expect(error).toMatchObject({ kind: 'timeout' });
    expect(logger.warn).toHaveBeenCalledWith('API_TIMEOUT', expect.any(Object));
  });

  it('erro que não vem do axios segue sem alteração', async () => {
    const original = new Error('inesperado');
    httpClient.defaults.adapter = () => Promise.reject(original);

    const error = await httpClient.get('/api/tarefas').catch((failure: unknown) => failure);

    expect(error).toBe(original);
  });
});

describe('política de erros por código', () => {
  it('NAO_AUTENTICADO encerra a sessão e limpa o cache', async () => {
    session.setToken('token-teste');
    queryClient.setQueryData(QUERY_KEYS.tasks, [{ id: 1 }]);
    respondWith(401, { codigo: 'NAO_AUTENTICADO', mensagem: 'Informe um token de acesso válido.' });

    await httpClient.get('/api/tarefas').catch(() => undefined);

    expect(session.getToken()).toBeNull();
    expect(queryClient.getQueryData(QUERY_KEYS.tasks)).toBeUndefined();
    expect(logger.warn).toHaveBeenCalledWith('SESSAO_EXPIRADA', expect.objectContaining({ codigo: 'NAO_AUTENTICADO' }));
  });

  it('CREDENCIAIS_INVALIDAS (também 401) não encerra a sessão', async () => {
    session.setToken('token-antigo');
    respondWith(401, { codigo: 'CREDENCIAIS_INVALIDAS', mensagem: 'E-mail ou senha inválidos.' });

    await httpClient.post('/api/auth/login', {}).catch(() => undefined);

    expect(session.getToken()).toBe('token-antigo');
  });

  it('SEM_EQUIPE recarrega o usuário atual e mantém a sessão', async () => {
    session.setToken('token-teste');
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);
    respondWith(403, { codigo: 'SEM_EQUIPE', mensagem: 'Você não pertence a nenhuma equipe.' });

    await httpClient.get('/api/tarefas').catch(() => undefined);

    expect(invalidate).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.currentUser });
    expect(session.getToken()).toBe('token-teste');
    expect(logger.warn).toHaveBeenCalledWith('ACESSO_NEGADO', expect.objectContaining({ codigo: 'SEM_EQUIPE' }));
  });

  it('SEM_PERMISSAO é registrado como acesso negado, sem mexer na sessão', async () => {
    session.setToken('token-teste');
    respondWith(403, { codigo: 'SEM_PERMISSAO', mensagem: 'Você não tem permissão para esta ação.' });

    await httpClient.delete('/api/tarefas/1').catch(() => undefined);

    expect(session.getToken()).toBe('token-teste');
    expect(logger.warn).toHaveBeenCalledWith('ACESSO_NEGADO', expect.objectContaining({ method: 'DELETE' }));
  });
});
