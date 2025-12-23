module.exports = {
  // Test environment
  preset: 'ts-jest',
  testEnvironment: 'node',

  // TypeScript configuration
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/frontend/**/*', // Exclude frontend from backend tests
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Module path mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@types/(.*)$': '<rootDir>/src/shared/types/$1',
    '^@enums/(.*)$': '<rootDir>/src/shared/enums/$1',
    '^@utils/(.*)$': '<rootDir>/src/shared/utils/$1',
    '^@backend/(.*)$': '<rootDir>/src/backend/$1',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/backend/tests/setup.ts'],

  // Test timeout
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Global variables
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },

  // Projects for different test types
  projects: [
    {
      displayName: 'Backend Tests',
      testMatch: ['<rootDir>/src/backend/**/*.test.ts', '<rootDir>/src/backend/**/*.spec.ts'],
      testPathIgnorePatterns: ['<rootDir>/src/frontend/'],
      setupFilesAfterEnv: ['<rootDir>/src/backend/tests/setup.ts'],
    },
    {
      displayName: 'Shared Tests',
      testMatch: ['<rootDir>/src/shared/**/*.test.ts', '<rootDir>/src/shared/**/*.spec.ts'],
      setupFilesAfterEnv: ['<rootDir>/src/shared/tests/setup.ts'],
    },
  ],

  // Collect coverage only from backend and shared code
  collectCoverageOnlyFrom: {
    '<rootDir>/src/backend/': true,
    '<rootDir>/src/shared/': true,
  },
}