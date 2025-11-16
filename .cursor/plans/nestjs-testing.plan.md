# Migrate API Testing to NestJS/Jest

## 1. Remove Vitest and Install Jest Dependencies

**Update `packages/api/package.json`:**

- Remove: `vitest`, `@vitest/coverage-v8`
- Add: `jest` (~29.7.0), `@types/jest` (~29.5.0), `ts-jest` (~29.1.0), `jest-mock-extended` (~3.0.0), `@faker-js/faker` (~9.3.0)
- Already installed: `@nestjs/testing`, `supertest`, `@types/supertest`
- Delete `packages/api/vitest.config.ts`

**Update test scripts:**

```json
"test": "jest",
"test:unit": "jest --testPathPattern=test/unit",
"test:integration": "jest --testPathPattern=test/integration",
"test:watch": "jest --watch",
"test:cov": "jest --coverage"
```

## 2. Create Jest Configuration

**Create `packages/api/jest.config.ts`:**

```ts
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
  coverageThresholds: {
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
```

**Key Configuration Details:**

- **ts-jest preset**: Transforms TypeScript files for Jest
- **moduleNameMapper**: Maps `.js` imports to `.ts` files (required for NestJS's ESM-style imports)
- **globalSetup**: Loads `.env.test` environment variables before all tests
- **setupFilesAfterEnv**: Runs setup code before each test file (useful for global test utilities)
- **Coverage exclusions**: Excludes DTOs, modules, and entry points from coverage requirements
- **testTimeout**: 10 seconds (sufficient for database operations in integration tests)

## 3. Database Setup for Integration Tests

**Create `packages/api/.env.test.example`:**

```env
# Test Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/sweetly_dipped_test"
```

**Note**: Copy `.env.test.example` to `.env.test` and update with actual credentials. Ensure `.env.test` is in `.gitignore`.

**Create `packages/api/test/global-setup.ts`:**

```ts
import { config } from 'dotenv';
import { resolve } from 'path';

export default async function globalSetup() {
  // Load .env.test environment variables
  config({ path: resolve(__dirname, '../.env.test') });
  
  console.log('✓ Global setup: Loaded .env.test environment variables');
}
```

**Create `packages/api/test/global-teardown.ts`:**

```ts
export default async function globalTeardown() {
  console.log('✓ Global teardown: Cleaning up test environment');
}
```

**Create `packages/api/test/setup-after-env.ts`:**

```ts
// This file runs before each test file
// Add global test utilities, custom matchers, or extended timeouts here

// Example: Extend Jest timeout for slow tests
jest.setTimeout(10000);
```

**Create `packages/api/test/setup-test-db.ts`:**

```ts
import { execSync } from 'child_process';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export async function setupTestDatabase() {
  try {
    // Run migrations on test database
    console.log('Running Prisma migrations on test database...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: process.env,
    });

    // Clear existing data
    console.log('Clearing test database...');
    await prisma.order.deleteMany();
    await prisma.form.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.unavailablePeriod.deleteMany();
    await prisma.timeSlot.deleteMany();
    await prisma.treatOption.deleteMany();
    await prisma.packageOption.deleteMany();

    // Seed test database with configuration data
    console.log('Seeding test database...');
    execSync('tsx prisma/seed.ts', {
      stdio: 'inherit',
      env: process.env,
    });

    console.log('✓ Test database setup complete');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Allow direct execution for manual setup
if (import.meta.url === `file://${process.argv[1]}`) {
  setupTestDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
```

**Key Setup Details:**

- **global-setup.ts**: Loads `.env.test` before all tests run (called once at start)
- **global-teardown.ts**: Cleanup hook after all tests complete
- **setup-after-env.ts**: Runs before each test file (useful for global test configuration)
- **setup-test-db.ts**: Database migration/seeding script (called manually or in pretest hook)

## 4. Create Test Directory Structure

```
packages/api/test/
├── unit/
│   ├── config/
│   │   └── config.service.spec.ts
│   ├── forms/
│   │   └── forms.service.spec.ts
│   └── health/
│       └── health.service.spec.ts
├── integration/
│   ├── config/
│   │   └── config.controller.spec.ts
│   ├── forms/
│   │   └── forms.controller.spec.ts
│   └── health/
│       └── health.controller.spec.ts
├── global-setup.ts         # Jest global setup (loads .env.test)
├── global-teardown.ts      # Jest global teardown
├── setup-after-env.ts      # Runs before each test file
└── setup-test-db.ts        # Database setup script
```

## 5. Write Unit Tests (Mock Dependencies)

**`test/unit/config/config.service.spec.ts`:**

- Mock PrismaService using `jest-mock-extended`
- Use `@faker-js/faker` to generate test values (labels, descriptions, prices, etc.)
- Test `getPackageOptions()`, `getTreatOptions()`, `getTimeSlots()`, `getUnavailablePeriods()`
- Verify proper data transformation from Prisma models to DTOs

**`test/unit/forms/forms.service.spec.ts`:**

- Mock PrismaService using `jest-mock-extended`
- Use `@faker-js/faker` to generate test values (names, emails, phone numbers, form data, etc.)
- Test all CRUD operations: `create()`, `findAll()`, `findOne()`, `update()`, `remove()`
- Test `submit()` workflow with order generation
- Test error cases: not found, bad request, validation errors

**`test/unit/health/health.service.spec.ts`:**

- No mocking needed (simple service)
- Test `getStatus()` returns correct structure

## 6. Write Integration Tests (Real Database)

**`test/integration/config/config.controller.spec.ts`:**

- Use `Test.createTestingModule()` from `@nestjs/testing`
- Import ConfigModule with real PrismaService
- Test all endpoints: GET `/config/packages`, `/config/treats`, `/config/time-slots`, `/config/unavailable-periods`
- Seed database with test data before tests
- Use `supertest` for HTTP requests

**`test/integration/forms/forms.controller.spec.ts`:**

- Import FormsModule with real PrismaService and PrismaModule
- Test full CRUD flow with database persistence
- Test POST `/forms`, GET `/forms`, GET `/forms/:id`, PUT `/forms/:id`, DELETE `/forms/:id`
- Test POST `/forms/:id/submit` with order creation
- Verify database state after operations

**Example test structure:**

```ts
// test/integration/forms/forms.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { FormsModule } from '../../../src/forms/forms.module.js';
import { PrismaModule } from '../../../src/prisma/prisma.module.js';
import { PrismaService } from '../../../src/prisma/prisma.service.js';

describe('FormsController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, FormsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.order.deleteMany();
    await prisma.form.deleteMany();
    await prisma.customer.deleteMany();
  });

  describe('POST /forms', () => {
    it('should create a form and persist it in the database', async () => {
      // Arrange: Generate test data using Faker
      const createFormDto = {
        formData: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number('###-###-####'),
          communicationMethod: 'email' as const,
          packageType: 'medium' as const,
          riceKrispies: 0,
          oreos: 0,
          pretzels: 0,
          marshmallows: 0,
          colorScheme: faker.color.human(),
          eventType: faker.word.noun(),
          theme: faker.word.adjective(),
          additionalDesigns: faker.lorem.sentence(),
          pickupDate: faker.date.future().toISOString().split('T')[0],
          pickupTime: '10:00 AM',
          rushOrder: false,
          referralSource: faker.word.noun(),
          termsAccepted: true,
          visitedSteps: new Set(['lead', 'communication', 'package']),
        },
        currentStep: 2,
      };

      // Act: Make HTTP request
      const response = await request(app.getHttpServer())
        .post('/forms')
        .send(createFormDto)
        .expect(201);

      // Assert: Verify response structure
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('formData');
      expect(response.body.formData.email).toBe(createFormDto.formData.email);
      expect(response.body.currentStep).toBe(2);

      // Assert: Verify database persistence
      const formInDb = await prisma.form.findUnique({
        where: { id: response.body.id },
        include: { customer: true },
      });

      expect(formInDb).toBeDefined();
      expect(formInDb!.formData.email).toBe(createFormDto.formData.email);
      expect(formInDb!.formData.firstName).toBe(createFormDto.formData.firstName);
      expect(formInDb!.currentStep).toBe(2);
      
      // Verify customer was created/upserted
      const customerInDb = await prisma.customer.findUnique({
        where: { email: createFormDto.formData.email },
      });
      expect(customerInDb).toBeDefined();
      expect(customerInDb!.email).toBe(createFormDto.formData.email);
    });
  });
});
```

**`test/integration/health/health.controller.spec.ts`:**

- Import HealthModule
- Test GET `/health` endpoint returns 200 with correct structure

## 7. Update Package Scripts

Add to `packages/api/package.json`:

```json
"db:test:setup": "dotenv -e .env.test -- tsx test/setup-test-db.ts",
"pretest:integration": "yarn db:test:setup"
```

## 8. Clean Up Old Files

- Stage deletion: `packages/api/src/config/config.controller.spec.ts`
- Stage deletion: `packages/api/src/config/config.service.spec.ts`
- Stage deletion: `packages/api/src/forms/forms.controller.spec.ts`
- Stage deletion: `packages/api/src/forms/forms.service.spec.ts`
- Delete: `packages/api/vitest.config.ts`

## 9. Verify and Run Tests

- Run `yarn install` in `packages/api`
- Run `yarn test:unit` - all unit tests should pass
- Run `yarn test:integration` - all integration tests should pass
- Run `yarn test:cov` - verify coverage meets 80% threshold
- Commit all changes with proper commit message

## Key Implementation Notes

- Use `jest-mock-extended`'s `mock<T>()` to create type-safe mocks
- Integration tests use real Prisma client connected to test database
- Each integration test suite should clean up its test data
- Mock PrismaService methods return proper Prisma types (not DTOs)
- All tests follow AAA pattern: Arrange, Act, Assert