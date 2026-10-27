import { logger } from '../src/core/log/logger';

afterEach(() => {
  jest.restoreAllMocks();
});

it('warn escreve o evento e o contexto no console de avisos', () => {
  const spy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

  logger.warn('API_REDE', { method: 'GET', path: '/api/tarefas', requestId: 'req-1' });

  expect(spy).toHaveBeenCalledWith('[taskflow] Falha de rede', {
    evento: 'API_REDE',
    method: 'GET',
    path: '/api/tarefas',
    requestId: 'req-1',
  });
});

it('error escreve o evento no console de erros', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

  logger.error('API_ERRO_SERVIDOR', { status: 500, codigo: 'ERRO_INTERNO' });

  expect(spy).toHaveBeenCalledWith('[taskflow] Erro do servidor', {
    evento: 'API_ERRO_SERVIDOR',
    status: 500,
    codigo: 'ERRO_INTERNO',
  });
});

it('sem contexto, registra só o evento', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

  logger.error('UI_FALHA_RENDER');

  expect(spy).toHaveBeenCalledWith('[taskflow] Falha ao desenhar a tela', { evento: 'UI_FALHA_RENDER' });
});
