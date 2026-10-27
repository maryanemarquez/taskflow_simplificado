import { newRequestId } from '../src/core/api/requestId';

const BACKEND_FORMAT = /^[A-Za-z0-9-]{1,64}$/;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('newRequestId', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto');

  afterEach(() => {
    if (original) {
      Object.defineProperty(globalThis, 'crypto', original);
    }
  });

  it('usa o gerador nativo quando existe', () => {
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: { randomUUID: () => '11111111-2222-4333-8444-555555555555' },
    });

    expect(newRequestId()).toBe('11111111-2222-4333-8444-555555555555');
  });

  it('sem crypto.randomUUID (celular, página sem contexto seguro) gera um UUID v4 aceito pelo backend', () => {
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: undefined });

    const id = newRequestId();

    expect(id).toMatch(UUID_V4);
    expect(id).toMatch(BACKEND_FORMAT);
  });

  it('o gerador próprio não repete ids', () => {
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: {} });

    const ids = new Set(Array.from({ length: 200 }, () => newRequestId()));

    expect(ids.size).toBe(200);
  });
});
