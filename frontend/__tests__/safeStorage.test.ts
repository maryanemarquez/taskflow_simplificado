import { safeStorage } from '../src/core/storage/safeStorage';

describe('safeStorage', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

  afterEach(() => {
    if (original) {
      Object.defineProperty(globalThis, 'localStorage', original);
    } else {
      Reflect.deleteProperty(globalThis, 'localStorage');
    }
  });

  it('grava, lê e remove quando há armazenamento', () => {
    const data = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => void data.set(key, value),
        removeItem: (key: string) => void data.delete(key),
      },
    });
    safeStorage.set('k', 'v');
    expect(safeStorage.get('k')).toBe('v');
    safeStorage.remove('k');
    expect(safeStorage.get('k')).toBeNull();
  });

  it('não lança sem armazenamento', () => {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: undefined });
    expect(safeStorage.get('k')).toBeNull();
    expect(() => safeStorage.set('k', 'v')).not.toThrow();
    expect(() => safeStorage.remove('k')).not.toThrow();
  });

  it('não lança quando o armazenamento recusa o acesso', () => {
    const fail = () => {
      throw new Error('bloqueado');
    };
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: { getItem: fail, setItem: fail, removeItem: fail },
    });
    expect(safeStorage.get('k')).toBeNull();
    expect(() => safeStorage.set('k', 'v')).not.toThrow();
    expect(() => safeStorage.remove('k')).not.toThrow();
  });
});
