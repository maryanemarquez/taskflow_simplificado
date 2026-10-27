const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['coverage/**', 'dist/**', '.expo/**'],
    rules: {
      'no-console': 'error',
      'no-unreachable': 'error',
    },
  },
  {
    // O logger é o único ponto de saída para o console.
    files: ['src/core/log/logger.ts'],
    rules: { 'no-console': 'off' },
  },
];
