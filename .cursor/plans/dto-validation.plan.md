# DTO Validation Migration Plan

## Overview

Refactor the API to separate DTO type definitions (interfaces in `@shared-types`) from validation logic (classes in `@api`). This enables type sharing across packages while maintaining runtime validation in the API.

## Phase 1: Install Dependencies

Add validation packages to `packages/api/package.json`:

```bash
yarn workspace @sweetly-dipped/api add class-validator class-transformer
```

## Phase 2: Move Interface Definitions to Shared Types

### Create new file: `packages/shared-types/dtoTypes.ts`

Export all DTO interfaces:

```typescript
import type { FormData } from './formTypes.js';

// Stored form uses array instead of Set for serialization
export type FormDataWithVisitedStepsArray = Omit<FormData, 'visitedSteps'> & {
  visitedSteps: string[];
};

export interface ICreateFormDto {
  formData: FormData;
  currentStep?: number;
}

export interface IUpdateFormDto {
  formData?: FormData;
  currentStep?: number;
  orderNumber?: string;
}

export interface IStoredFormDto {
  id: string;
  formData: FormDataWithVisitedStepsArray;
  currentStep: number;
  orderNumber?: string;
  status?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISubmitFormDto {
  orderNumber: string;
  submittedAt: string;
}
```

### Update `packages/shared-types/index.ts`

Add exports:

```typescript
export * from './formTypes.js';
export * from './configTypes.js';
export * from './dtoTypes.js';
```

## Phase 3: Create Validation Classes in API

### Create nested validation DTO for FormData

**File: `packages/api/src/forms/dto/form-data.dto.ts`**

```typescript
import {
  IsString,
  IsEmail,
  IsBoolean,
  IsInt,
  Min,
  IsIn,
  IsDateString,
  IsOptional,
  IsArray,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FormDataDto {
  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @Matches(/^\d{3}-\d{3}-\d{4}$/, {
    message: 'Phone must be in format XXX-XXX-XXXX',
  })
  @IsOptional()
  phone: string;

  @IsIn(['email', 'text', ''])
  @IsOptional()
  communicationMethod: 'email' | 'text' | '';

  @IsIn(['small', 'medium', 'large', 'xl', 'by-dozen', ''])
  @IsOptional()
  packageType: 'small' | 'medium' | 'large' | 'xl' | 'by-dozen' | '';

  @IsInt()
  @Min(0)
  @IsOptional()
  riceKrispies: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  oreos: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  pretzels: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  marshmallows: number;

  @IsString()
  @IsOptional()
  colorScheme: string;

  @IsString()
  @IsOptional()
  eventType: string;

  @IsString()
  @IsOptional()
  theme: string;

  @IsString()
  @IsOptional()
  additionalDesigns: string;

  @IsDateString()
  @IsOptional()
  pickupDate: string;

  @IsString()
  @IsOptional()
  pickupTime: string;

  @IsBoolean()
  @IsOptional()
  rushOrder: boolean;

  @IsString()
  @IsOptional()
  referralSource: string;

  @IsBoolean()
  @IsOptional()
  termsAccepted: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  visitedSteps: string[];
}
```

### Replace existing DTO files with validation classes

**File: `packages/api/src/forms/dto/create-form.dto.ts`**

```typescript
import { Type } from 'class-transformer';
import { ValidateNested, IsOptional, IsInt, Min } from 'class-validator';
import type { ICreateFormDto } from '@sweetly-dipped/shared-types';
import { FormDataDto } from './form-data.dto.js';

export class CreateFormDto implements ICreateFormDto {
  @ValidateNested()
  @Type(() => FormDataDto)
  formData: FormDataDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentStep?: number;
}
```

**File: `packages/api/src/forms/dto/update-form.dto.ts`**

```typescript
import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsOptional,
  IsInt,
  Min,
  IsString,
} from 'class-validator';
import type { IUpdateFormDto } from '@sweetly-dipped/shared-types';
import { FormDataDto } from './form-data.dto.js';

export class UpdateFormDto implements IUpdateFormDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => FormDataDto)
  formData?: FormDataDto;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentStep?: number;

  @IsOptional()
  @IsString()
  orderNumber?: string;
}
```

**File: `packages/api/src/forms/dto/submit-form.dto.ts`**

Note: This DTO is used only as a response type. The submit endpoint accepts only an `id` parameter and generates `orderNumber` and `submittedAt` server-side, so no validation decorators are needed.

```typescript
import type { ISubmitFormDto } from '@sweetly-dipped/shared-types';

export class SubmitFormDto implements ISubmitFormDto {
  orderNumber: string;
  submittedAt: string;
}
```

Alternatively, if you prefer not to create a class for response-only types, you can use the interface directly in the controller return type and omit this file entirely.

**File: `packages/api/src/forms/dto/stored-form.dto.ts`**

Note: This DTO is used only as a response type (returned from `findAll`, `findOne`, `create`, and `update`). It does not validate incoming request data, so validation decorators are not needed. We use the `FormDataWithVisitedStepsArray` type directly since ValidationPipe only validates incoming requests, not responses. Response objects are simply serialized to JSON.

```typescript
import type { IStoredFormDto, FormDataWithVisitedStepsArray } from '@sweetly-dipped/shared-types';

export class StoredFormDto implements IStoredFormDto {
  id: string;
  formData: FormDataWithVisitedStepsArray;
  currentStep: number;
  orderNumber?: string;
  status?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Phase 4: Configure Global ValidationPipe

### Update `packages/api/src/main.ts`

Add global validation configuration after creating the app:

```typescript
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      whitelist: true, // Strip properties not in DTO (unknown properties removed silently)
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types (string to number, etc.)
      },
    })
  );

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || true,
    credentials: true,
  });
  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 API server running on http://localhost:${port}`);
  logger.log(`📊 Health check: http://localhost:${port}/api/health`);
  logger.log(`📝 Forms API: http://localhost:${port}/api/forms`);
}

void bootstrap();
```

## Phase 5: Update Controller Imports

### Update `packages/api/src/forms/forms.controller.ts`

Change imports to use classes instead of types:

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateFormDto } from './dto/create-form.dto.js';
import { UpdateFormDto } from './dto/update-form.dto.js';
import { StoredFormDto } from './dto/stored-form.dto.js';
import { SubmitFormDto } from './dto/submit-form.dto.js';
import { FormsService } from './forms.service.js';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get()
  findAll(): Promise<StoredFormDto[]> {
    return this.formsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<StoredFormDto> {
    return this.formsService.findOne(id);
  }

  @Post()
  create(@Body() createFormDto: CreateFormDto): Promise<StoredFormDto> {
    return this.formsService.create(createFormDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto
  ): Promise<StoredFormDto> {
    return this.formsService.update(id, updateFormDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.formsService.remove(id);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string): Promise<SubmitFormDto> {
    return this.formsService.submit(id);
  }
}
```

## Phase 6: Update Service Layer

The service layer should continue working with the DTO classes. No changes needed unless you want to use interfaces for type hints in method signatures.

## Phase 7: Update Frontend Imports (Optional)

If the frontend (`packages/web`) uses these types, update imports to use the new shared interfaces:

```typescript
import type { ICreateFormDto, IStoredFormDto } from '@sweetly-dipped/shared-types';
```

## Phase 8: Testing Updates

Update integration tests to expect validation errors:

**File: `packages/api/test/integration/forms/forms.controller.spec.ts`**

Add tests for validation scenarios:

```typescript
describe('POST /forms - validation', () => {
  it('should reject invalid email', async () => {
    const invalidForm = {
      formData: {
        email: 'not-an-email',
        // ... other fields
      },
    };

    const response = await request(app.getHttpServer())
      .post('/api/forms')
      .send(invalidForm)
      .expect(400);

    expect(response.body.message).toContain('email');
  });

  it('should reject invalid phone format', async () => {
    const invalidForm = {
      formData: {
        phone: '1234567890', // Missing dashes
      },
    };

    const response = await request(app.getHttpServer())
      .post('/api/forms')
      .send(invalidForm)
      .expect(400);

    expect(response.body.message).toContain('Phone must be in format XXX-XXX-XXXX');
  });

  it('should strip unknown properties without throwing error', async () => {
    const formWithExtra = {
      formData: { /* valid data */ },
      unknownField: 'should be removed',
    };

    const response = await request(app.getHttpServer())
      .post('/api/forms')
      .send(formWithExtra)
      .expect(201);

    // Verify unknownField was stripped - the request succeeds with 201,
    // and the created form should not contain unknownField in the response
    expect(response.body).not.toHaveProperty('unknownField');
  });
});
```

## Key Implementation Details

### ValidationPipe Options Explained

- **`transform: true`**: Converts plain JavaScript objects to class instances
- **`whitelist: true`**: Automatically strips properties not decorated with validation decorators (unknown properties are removed silently, no error thrown)
- **`enableImplicitConversion: true`**: Converts types (e.g., "123" → 123)

Note: We use `whitelist: true` without `forbidNonWhitelisted: true` to allow unknown properties in requests but automatically strip them. This provides a lenient API that accepts extra fields without failing, while ensuring only validated properties reach the controller.

### Validation Decorator Patterns

- **`@IsOptional()`**: Field can be undefined/null
- **`@ValidateNested()`**: Validate nested objects
- **`@Type(() => Class)`**: Transform nested objects to class instances
- **`@IsIn([...])`**: Enum validation
- **`@Matches(regex)`**: String pattern validation
- **`@Min(n)`**: Number minimum value

### Input vs Response DTOs

**Input DTOs** (with `@Body()` decorator) require validation decorators:

- `CreateFormDto` - validates incoming POST request body
- `UpdateFormDto` - validates incoming PUT request body

**Response DTOs** (return types only) do NOT need validation decorators:

- `SubmitFormDto` - used only as return type, values generated server-side
- `StoredFormDto` - used as return type (validation occurs on input DTOs). The nested `formData` property uses the `FormDataWithVisitedStepsArray` type directly rather than the `FormDataDto` class, since ValidationPipe never validates response objects.

Only add validation decorators to DTOs that validate incoming request data. Response-only DTOs can be simple classes implementing the interface without decorators. For nested properties in response DTOs, you can use interface types directly (like `FormDataWithVisitedStepsArray`) instead of validation classes, since ValidationPipe only validates incoming requests, not outgoing responses.

### Type Safety Maintained

Each validation class implements the corresponding interface from `@shared-types`, ensuring:

1. Type compatibility across packages
2. Compile-time type checking
3. Runtime validation
4. Single source of truth for types

## Phase 9: Final Verification

Run the complete precommit quality gate to ensure all changes pass:

```bash
yarn precommit
```

This will run:

- `yarn lint --force` - ESLint across all packages
- `yarn type-check --force` - TypeScript compilation checks
- `yarn test --force` - All unit and integration tests
- `yarn test:e2e --force` - End-to-end tests

All checks must pass before considering the migration complete.

## Files Modified

1. `packages/shared-types/dtoTypes.ts` (new)
2. `packages/shared-types/index.ts` (updated)
3. `packages/api/src/forms/dto/form-data.dto.ts` (new)
4. `packages/api/src/forms/dto/create-form.dto.ts` (refactored)
5. `packages/api/src/forms/dto/update-form.dto.ts` (refactored)
6. `packages/api/src/forms/dto/stored-form.dto.ts` (refactored)
7. `packages/api/src/forms/dto/submit-form.dto.ts` (refactored)
8. `packages/api/src/main.ts` (updated)
9. `packages/api/src/forms/forms.controller.ts` (updated)
10. `packages/api/package.json` (dependencies added)
11. `packages/api/test/integration/forms/forms.controller.spec.ts` (tests added)

## To-dos

- [ ] Install class-validator and class-transformer in API package
- [ ] Create dtoTypes.ts in shared-types with interface definitions
- [ ] Create FormDataDto validation class with all field validators
- [ ] Convert all DTO files to validation classes implementing interfaces
- [ ] Add global ValidationPipe configuration in main.ts
- [ ] Update controller imports to use classes instead of types
- [ ] Add validation test cases to integration tests
- [ ] Build and test all packages to ensure no regressions
- [ ] Run yarn precommit to verify all quality gates pass