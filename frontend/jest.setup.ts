process.env.EXPO_PUBLIC_API_URL = 'http://localhost:8080';

const values = new Map<string, string>();

const localStorageMock: Storage = {
  get length() {
    return values.size;
  },
  clear: () => values.clear(),
  getItem: (key) => values.get(key) ?? null,
  key: (index) => Array.from(values.keys())[index] ?? null,
  removeItem: (key) => values.delete(key),
  setItem: (key, value) => values.set(key, value),
};

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageMock,
});

// Os ícones carregam fontes de forma assíncrona; nos testes basta um marcador simples.
jest.mock('@expo/vector-icons', () => {
  const { Text } = jest.requireActual('react-native');
  const { createElement } = jest.requireActual('react');
  return { Feather: ({ name }: { name: string }) => createElement(Text, { testID: `icon-${name}` }, null) };
});
