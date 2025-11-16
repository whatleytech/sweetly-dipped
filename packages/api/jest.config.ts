import type { Config } from 'jest';

const config: Config = {
  // Use ts-jest for TypeScript transformation
  preset: 'ts-jest',
  
  // Node environment for NestJS
  testEnvironment: 'node',
  
  // Root directory for tests
  rootDir: '.',
  
  // Test file patterns
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  
  // Module file extensions
  moduleFileExtensions: ['js', 'json', 'ts'],
  
  // Transform TypeScript files with ts-jest
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        // Allow .js imports to resolve to .ts files
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
      },
    }],
  },
  
  // Map .js imports to .ts files (NestJS uses .js extensions in imports)
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/dto/*.ts',
  ],
  
  coverageDirectory: '<rootDir>/coverage',
  
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Coverage thresholds per AGENTS.md (80% for API layer)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Paths to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/generated/',
    '/coverage/',
  ],
  
  // Global setup for integration tests (loads .env.test)
  globalSetup: '<rootDir>/test/global-setup.ts',
  
  // Global teardown
  globalTeardown: '<rootDir>/test/global-teardown.ts',
  
  // Setup files after environment (run before each test file)
  setupFilesAfterEnv: ['<rootDir>/test/setup-after-env.ts'],
  
  // Increase timeout for integration tests
  testTimeout: 10000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
};

export default config;

