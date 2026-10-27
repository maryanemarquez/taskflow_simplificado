module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Máquinas lentas (Windows com antivírus, CI) estouravam os 5 s padrão no primeiro render.
  testTimeout: 15000,
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  collectCoverageFrom: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
};
