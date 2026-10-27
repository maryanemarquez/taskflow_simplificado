import { ApiRequestError, NetworkRequestError } from '../src/core/api/httpErrors';
import { queryClient, shouldRetryQuery } from '../src/core/api/queryClient';

describe('shouldRetryQuery', () => {
  it('repete uma vez a consulta que falhou por falta de conexão', () => {
    const error = new NetworkRequestError('network');

    expect(shouldRetryQuery(0, error)).toBe(true);
    expect(shouldRetryQuery(1, error)).toBe(false);
  });

  it('não repete tempo esgotado, erro da API nem erro desconhecido', () => {
    expect(shouldRetryQuery(0, new NetworkRequestError('timeout'))).toBe(false);
    expect(shouldRetryQuery(0, new ApiRequestError({ codigo: 'ERRO_INTERNO' }, { status: 500 }))).toBe(false);
    expect(shouldRetryQuery(0, new Error('falha'))).toBe(false);
  });

  it('mutações nunca são repetidas', () => {
    expect(queryClient.getDefaultOptions().mutations?.retry).toBe(false);
  });
});
