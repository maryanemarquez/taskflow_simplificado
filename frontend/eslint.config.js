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
];
