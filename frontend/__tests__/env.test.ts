import { env, requireEnv } from '../src/core/config/env';
import { REQUEST_TIMEOUT_MS, httpClient } from '../src/core/api/httpClient';

describe('requireEnv', () => {
  it('devolve o valor sem espaços nas pontas', () => {
    expect(requireEnv('X', ' http://api ')).toBe('http://api');
  });

  it.each([undefined, '', '   '])('falha com mensagem clara quando o valor é %p', (value) => {
    expect(() => requireEnv('EXPO_PUBLIC_API_URL', value)).toThrow(/EXPO_PUBLIC_API_URL/);
  });
});

it('o cliente HTTP usa a URL configurada e um tempo limite', () => {
  expect(httpClient.defaults.baseURL).toBe(env.apiUrl);
  expect(httpClient.defaults.timeout).toBe(REQUEST_TIMEOUT_MS);
  expect(REQUEST_TIMEOUT_MS).toBe(15_000);
});
