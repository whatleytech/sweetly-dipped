# Express to NestJS Migration Plan

## Overview

Replace the existing Express.js backend with NestJS, maintaining all current endpoints and functionality. Store data in-memory within the service layer, and create simple DTOs without validation.

## Current Endpoints to Replicate

- **Health**: `GET /api/health` - Returns health status
- **Forms**: 
  - `GET /api/forms` - List all forms
  - `GET /api/forms/:id` - Get form by ID
  - `POST /api/forms` - Create new form
  - `PUT /api/forms/:id` - Update form
  - `DELETE /api/forms/:id` - Delete form
- **Order**: `POST /api/order/number` - Generate order number

## Implementation Steps

### 1. Install NestJS Dependencies

Add required NestJS packages to `packages/api/package.json`:

- `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`
- Keep existing dependencies: `cors`, `dotenv`, `@sweetly-dipped/shared-types`

### 2. Use Nest CLI to Generate Project Structure

Use Nest CLI from `packages/api/` directory to generate modules, controllers, and services:

**CLI Commands:**

- `cd packages/api`
- `nest g module health`
- `nest g controller health --no-spec`
- `nest g module forms`
- `nest g controller forms --no-spec`
- `nest g service forms --no-spec`
- `nest g module orders`
- `nest g controller orders --no-spec`
- `nest g service orders --no-spec`

**Manual Files:**

- Create DTOs in respective `dto/` folders
- Create `main.ts` entry point
- Update `app.module.ts` configuration

**Final Structure:**

```
src/
├── main.ts                    # Manual
├── app.module.ts              # CLI + Manual config
├── health/
│   ├── health.controller.ts   # CLI generated
│   └── health.module.ts       # CLI generated
├── forms/
│   ├── dto/
│   │   ├── create-form.dto.ts # Manual
│   │   ├── update-form.dto.ts # Manual
│   │   └── stored-form.dto.ts # Manual
│   ├── forms.controller.ts    # CLI generated
│   ├── forms.service.ts       # CLI generated
│   └── forms.module.ts        # CLI generated
└── orders/
    ├── dto/
    │   └── order-number.dto.ts # Manual
    ├── orders.controller.ts    # CLI generated
    ├── orders.service.ts       # CLI generated
    └── orders.module.ts        # CLI generated
```

### 3. Create DTOs

Simple DTOs without validation decorators:

- `CreateFormDto` - matches POST /api/forms request body
- `UpdateFormDto` - matches PUT /api/forms/:id request body  
- `StoredFormDto` - matches response structure with id, timestamps
- `OrderNumberDto` - simple response with orderNumber field

### 4. Create Services with In-Memory Storage

- `FormsService` - Move `formDataStore` Map from controller, implement serialization/deserialization helpers
- `OrdersService` - Move `orderCountStore` Map from controller, implement order number generation

### 5. Create Controllers

- `HealthController` - `@Get()` returning status and timestamp
- `FormsController` - All CRUD operations with `@Get()`, `@Post()`, `@Put()`, `@Delete()` decorators
- `OrdersController` - `@Post('number')` for order number generation

### 6. Create Modules

- `HealthModule` - Register HealthController
- `FormsModule` - Register FormsController and FormsService
- `OrdersModule` - Register OrdersController and OrdersService
- `AppModule` - Import all feature modules, configure CORS and global prefix

### 7. Create Main Entry Point

Create `src/main.ts`:

- Bootstrap NestJS application
- Enable CORS
- Set global prefix to `/api`
- Listen on port 3001
- Log startup messages similar to current Express app

### 8. Update Configuration Files

- Update `tsconfig.json` paths for NestJS structure
- Update `package.json` scripts (`dev` script should use `nest start --watch`)
- Keep ESLint and Prettier configurations
- Keep existing `.env.example` and environment setup

### 9. Clean Up Express Files

Remove old Express implementation:

- Delete `src/api.ts`
- Delete old `src/controllers/` directory (forms-controller.ts, health-controller.ts, order-controller.ts)
- Delete `src/index.ts` (replaced by `main.ts`)

## Key Implementation Details

**Forms Service In-Memory Storage:**

- Maintain `Map<string, StoredFormData>` from current implementation
- Keep `serializeFormData` and `deserializeFormData` helpers for Set/Array conversion
- Generate IDs using same pattern: `form-${Date.now()}-${Math.random()...}`

**Orders Service In-Memory Storage:**

- Maintain `Map<string, number>` for order counts per date
- Keep same order number format: `YYYY-MM-DD-###`

**CORS Configuration:**

- Enable CORS in `main.ts` similar to current Express setup

**Error Handling:**

- Use NestJS built-in exceptions (NotFoundException, BadRequestException)
- Maintain same HTTP status codes as Express implementation

## Files to Create/Modify

**Create:**

- `src/main.ts`
- `src/app.module.ts`
- `src/health/*` (controller, module)
- `src/forms/*` (controller, service, module, DTOs)
- `src/orders/*` (controller, service, module, DTOs)

**Modify:**

- `packages/api/package.json` (dependencies, scripts)
- `packages/api/tsconfig.json` (if needed for NestJS)

**Delete:**

- `src/api.ts`
- `src/index.ts`
- `src/controllers/` (entire directory)

## Post-Migration Verification

After migration, the API should respond identically to:

- `GET http://localhost:3001/api/health`
- All `/api/forms` endpoints
- `POST http://localhost:3001/api/order/number`