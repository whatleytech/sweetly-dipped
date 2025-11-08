# Migrate to Prisma Database Persistence

## 1. Update Prisma Schema

**File**: `packages/api/prisma/schema.prisma`

**Make `customerId` optional on Form model** (line 34):

```prisma
model Form {
  id         String   @id @default(uuid())
  customerId String?  @map("customer_id")  // Make optional - customer info collected in step 1
  
  // ... rest of fields unchanged ...
  
  customer  Customer? @relation(fields: [customerId], references: [id], onDelete: Cascade)
  order     Order?
  
  @@map("forms")
  // ... indexes unchanged ...
}
```

**Add the `OrderCounter` model** after the `Order` model:

```prisma
model OrderCounter {
  id        String   @id @default(uuid())
  date      String   @unique  // YYYY-MM-DD format
  count     Int      @default(0)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@map("order_counters")
}
```

**Rationale**: Forms are created on page load (step 0) before customer information is collected in step 1. Making `customerId` optional allows forms to exist without customer data initially.

## 2. Create PrismaService Module

**New Files**:

- `packages/api/src/prisma/prisma.service.ts` - Service that extends PrismaClient
- `packages/api/src/prisma/prisma.module.ts` - Global module that provides PrismaService

Follow the pattern from [NestJS Prisma Recipe](https://docs.nestjs.com/recipes/prisma#use-prisma-client-in-your-nestjs-services):

```typescript
// prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }
  
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```
```typescript
// prisma.module.ts
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

## 3. Update FormsService

**File**: `packages/api/src/forms/forms.service.ts`

- Inject `PrismaService` via constructor
- Replace `formDataStore` Map with Prisma queries
- **create()**: Upsert Customer by email, then create Form with data mapping
- **findAll()**: Query all forms with customer relations
- **findOne()**: Query single form with customer relation
- **update()**: Update form and upsert customer if email changed
- **remove()**: Delete form (cascade will handle Order)

**Data Mapping Strategy**:

- Map FormData fields to Prisma columns: firstName, lastName, email, phone, communicationMethod, pickupDate, pickupTime, rushOrder, packageType, riceKrispies, oreos, pretzels, marshmallows, referralSource
- Store in JSONB `data` field: colorScheme, eventType, theme, additionalDesigns, termsAccepted, visitedSteps (as array), currentStep
- Handle visitedSteps Set ↔ Array conversion

## 4. Update OrdersService

**File**: `packages/api/src/orders/orders.service.ts`

- Inject `PrismaService` via constructor
- Remove `orderCountStore` Map
- **generateOrderNumber()**: Use atomic upsert on OrderCounter table
  - Upsert counter for date, increment count
  - Return formatted order number: `${date}-${count.padStart(3, '0')}`

**Note**: This method will be called when creating an Order, not standalone. The Orders controller may need refactoring or the endpoint might become obsolete if order numbers are only generated during form submission.

## 5. Update FormsController

**File**: `packages/api/src/forms/forms.controller.ts`

If there's logic for form submission that creates orders, ensure it:

- Generates order number via OrdersService
- Creates Order record in database
- Links Order to Form and Customer

## 6. Update Module Imports

**Files**:

- `packages/api/src/app.module.ts` - Import PrismaModule
- `packages/api/src/forms/forms.module.ts` - Inject PrismaService (via global)
- `packages/api/src/orders/orders.module.ts` - Inject PrismaService (via global)

## 7. Generate Prisma Client & Push Schema

- Run `yarn prisma generate` to regenerate client with new OrderCounter model
- Push schema to database: `yarn prisma db push` (no migration files created)

## Data Flow Summary

**Form Creation/Update**:

1. Receive FormData via API
2. Upsert Customer (email as unique key)
3. Create/Update Form with mapped fields + JSONB data
4. Return StoredFormDto with reconstructed FormData

**Order Creation** (on form submission):

1. Call OrdersService.generateOrderNumber()
2. Atomically increment OrderCounter for date
3. Create Order record with generated number
4. Link to Form and Customer

## Migration Considerations

- Existing in-memory data will be lost (expected for development)
- Database must be running and accessible
- Environment variable `DATABASE_URL` must be set