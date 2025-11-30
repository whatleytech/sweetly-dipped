<!-- 2fd7195b-c9d4-455f-b5f4-4d66c5c137b0 61058040-560e-4ea3-b43e-1454c37e465a -->
# Additional Designs Configuration

## Overview

Transform the AdditionalDesigns form step from a free-text field to a multi-select checkbox system backed by the config API, with dynamic pricing based on package size.

## Database Layer

### 1. Add AdditionalDesignOption Model

**File**: [`packages/api/prisma/schema.prisma`](packages/api/prisma/schema.prisma)

Add new model after `TreatOption`:

```prisma
model AdditionalDesignOption {
  id                  String   @id @default(uuid())
  name                String
  description         String?
  basePrice           Int      // Base price for S/M packages or flat rate
  largePriceIncrease  Int      @default(0) @map("large_price_increase")  // Additional for L/XL
  perDozenPrice       Int?     @map("per_dozen_price")  // Price for by-dozen orders
  isActive            Boolean  @default(true) @map("is_active")
  sortOrder           Int      @default(0) @map("sort_order")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")
  
  @@map("additional_design_options")
}
```

**Pricing Logic**:

- **S/M packages**: Use `basePrice` for all options
- **L/XL packages**: Use `basePrice + largePriceIncrease` (if `largePriceIncrease > 0`, add it; otherwise use `basePrice` only)
- **By-dozen orders**: Use `perDozenPrice` if set, otherwise fall back to `basePrice` (ensures flat-rate options don't incorrectly cost $0)

### 2. Seed Additional Design Options

**File**: [`packages/api/prisma/seed.ts`](packages/api/prisma/seed.ts)

Add seed data with complete field values. Since `name` is not unique in the schema, use `findFirst` + `update`/`create` pattern:

```typescript
const additionalDesignOptions = [
  {
    name: 'Sprinkles',
    description: 'Custom sprinkles decoration',
    basePrice: 10,
    largePriceIncrease: 0,
    perDozenPrice: null,
    sortOrder: 1,
  },
  {
    name: 'Gold or silver painted',
    description: 'Gold or silver painted accents',
    basePrice: 20,
    largePriceIncrease: 0,
    perDozenPrice: null,
    sortOrder: 2,
  },
  {
    name: 'Edible images or logos',
    description: 'Custom edible images or logos printed on treats',
    basePrice: 40,
    largePriceIncrease: 20,
    perDozenPrice: 15,
    sortOrder: 3,
  },
  {
    name: 'Individually wrapped treats',
    description: 'Each treat individually wrapped',
    basePrice: 40,
    largePriceIncrease: 20,
    perDozenPrice: 15,
    sortOrder: 4,
  },
];

for (const option of additionalDesignOptions) {
  const existing = await prisma.additionalDesignOption.findFirst({
    where: { name: option.name },
  });

  if (existing) {
    await prisma.additionalDesignOption.update({
      where: { id: existing.id },
      data: option,
    });
  } else {
    await prisma.additionalDesignOption.create({
      data: option,
    });
  }
}
```

### 3. Create Migration

Run: `yarn workspace @sweetly-dipped/api db:migrate` (after schema changes)

## Shared Types

### 4. Add AdditionalDesignOptionDto

**File**: [`packages/shared-types/configTypes.ts`](packages/shared-types/configTypes.ts)

```typescript
export interface AdditionalDesignOptionDto {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  largePriceIncrease: number;
  perDozenPrice?: number;
}
```

**File**: [`packages/shared-types/index.ts`](packages/shared-types/index.ts)

Ensure `AdditionalDesignOptionDto` is exported:

```typescript
export type { AdditionalDesignOptionDto } from './configTypes';
```

### 5. Update FormData Type

**File**: [`packages/shared-types/formTypes.ts`](packages/shared-types/formTypes.ts)

Replace:

```typescript
additionalDesigns: string;
```

With:

```typescript
selectedAdditionalDesigns: string[]; // Array of design option IDs
```

**File**: [`packages/api/src/forms/dto/form-data.dto.ts`](packages/api/src/forms/dto/form-data.dto.ts)

Update validation:

Replace:

```typescript
@IsOptional()
@IsString()
additionalDesigns?: string | null;
```

With:

```typescript
@IsOptional()
@IsArray()
@IsString({ each: true })
selectedAdditionalDesigns?: string[] | null;
```

**File**: [`packages/api/src/forms/forms.service.ts`](packages/api/src/forms/forms.service.ts)

Update the following functions:

1. **`normalizeFormDataInput()`**: Change `additionalDesigns` to `selectedAdditionalDesigns`:
```typescript
selectedAdditionalDesigns: Array.isArray(data.selectedAdditionalDesigns) 
  ? data.selectedAdditionalDesigns.filter((id): id is string => typeof id === 'string')
  : [],
```

2. **`buildJsonData()`**: Change field name:
```typescript
selectedAdditionalDesigns: formData.selectedAdditionalDesigns,
```

3. **`getFormMetadata()`**: Update interface and extraction:
```typescript
interface FormMetadata {
  // ... other fields
  selectedAdditionalDesigns: string[];
  // ... rest
}

const toArrayField = (value: Prisma.JsonValue | undefined): string[] => {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  return [];
};

// In getFormMetadata:
selectedAdditionalDesigns: toArrayField(json.selectedAdditionalDesigns),
```

4. **`toFormDataFromRecord()`**: Update mapping:
```typescript
selectedAdditionalDesigns: metadata.selectedAdditionalDesigns,
```


## API Layer

### 6. Add Config Controller Endpoint

**File**: [`packages/api/src/config/config.controller.ts`](packages/api/src/config/config.controller.ts)

Add new endpoint:

```typescript
@Get('additional-designs')
async getAdditionalDesigns(): Promise<AdditionalDesignOptionDto[]> {
  return this.configService.getAdditionalDesignOptions();
}
```

### 7. Add Config Service Method

**File**: [`packages/api/src/config/config.service.ts`](packages/api/src/config/config.service.ts)

Add method following existing patterns (like `getPackageOptions`):

```typescript
async getAdditionalDesignOptions(): Promise<AdditionalDesignOptionDto[]> {
  const options = await this.prisma.additionalDesignOption.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  
  return options.map((option) => ({
    id: option.id,
    name: option.name,
    description: option.description ?? undefined,
    basePrice: option.basePrice,
    largePriceIncrease: option.largePriceIncrease,
    perDozenPrice: option.perDozenPrice ?? undefined,
  }));
}
```

## Frontend API Integration

### 8. Add API Client Method

**File**: [`packages/web/src/api/configApi.ts`](packages/web/src/api/configApi.ts)

Add method to the `configApi` object following existing patterns:

```typescript
export const configApi = {
  // ... existing methods
  async getAdditionalDesignOptions(): Promise<AdditionalDesignOptionDto[]> {
    return fetchConfig<AdditionalDesignOptionDto[]>('additional-designs');
  },
};
```

### 9. Add useConfigQuery Hook

**File**: [`packages/web/src/hooks/useConfigQuery.ts`](packages/web/src/hooks/useConfigQuery.ts)

Add hook following existing patterns (note: use `configApi` object method and consistent query key):

```typescript
export function useAdditionalDesignOptions() {
  return useQuery<AdditionalDesignOptionDto[]>({
    queryKey: ['config', 'additional-designs'],
    queryFn: () => configApi.getAdditionalDesignOptions(),
    staleTime: Infinity,
  });
}
```

## Frontend Components

### 10. Update AdditionalDesigns Component

**File**: [`packages/web/src/components/FormSteps/AdditionalDesigns.tsx`](packages/web/src/components/FormSteps/AdditionalDesigns.tsx)

Transform from textarea to multi-select checkboxes:

- Fetch options using `useAdditionalDesignOptions()`
- Show loading/error states (follow pattern from `ByTheDozen.tsx`)
- Render checkbox for each option with name and a price label derived from the current `formData.packageType` (or `basePrice` with a "starting at" note when no package is selected)
- Handle checkbox change with updated field name (`selectedAdditionalDesigns`)
- Update description text to match new functionality

**Checkbox Implementation Pattern**:

Follow the checkbox/radio pattern from `PackageSelection.tsx` or `CommunicationPreference.tsx`. Use CSS module classes:

```typescript
<div className={styles.checkboxGroup}>
  {options.map((option) => {
    const isSelected = formData.selectedAdditionalDesigns?.includes(option.id) ?? false;
    const displayPrice = calculateDisplayPrice(option, formData.packageType);
    
    return (
      <label
        key={option.id}
        className={`${styles.checkboxOption} ${isSelected ? styles.selected : ''}`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => handleToggle(option.id)}
          className={styles.checkboxInput}
        />
        <span className={styles.checkboxLabel}>
          {option.name} {displayPrice && `— $${displayPrice}`}
        </span>
        {option.description && (
          <div className={styles.checkboxDescription}>{option.description}</div>
        )}
      </label>
    );
  })}
</div>
```

**Price Display Logic**:

```typescript
const calculateDisplayPrice = (
  option: AdditionalDesignOptionDto,
  packageType: FormData['packageType']
): number => {
  if (!packageType || packageType === '') {
    return option.basePrice; // Show "starting at" price
  }
  
  if (packageType === 'by-dozen') {
    return option.perDozenPrice ?? option.basePrice;
  }
  
  if (packageType === 'large' || packageType === 'xl') {
    return option.basePrice + (option.largePriceIncrease > 0 ? option.largePriceIncrease : 0);
  }
  
  return option.basePrice; // small/medium
};
```

### 11. Add Price Calculation Utility

**File**: [`packages/web/src/utils/priceCalculations.ts`](packages/web/src/utils/priceCalculations.ts) (create if doesn't exist)

Create new file with utility function:

```typescript
import type { AdditionalDesignOptionDto } from '@sweetly-dipped/shared-types';
import type { FormData } from '@sweetly-dipped/shared-types';

/**
 * Calculates the total price for selected additional design options
 * based on the package type.
 * 
 * Pricing logic:
 * - S/M packages: basePrice
 * - L/XL packages: basePrice + largePriceIncrease (if largePriceIncrease > 0)
 * - By-dozen: perDozenPrice if set, otherwise basePrice
 */
export const calculateAdditionalDesignsTotal = (
  selectedDesignIds: string[],
  designOptions: AdditionalDesignOptionDto[],
  packageType: FormData['packageType']
): number => {
  return selectedDesignIds.reduce((total, id) => {
    const option = designOptions.find((opt) => opt.id === id);
    if (!option) {
      return total;
    }

    if (packageType === "by-dozen") {
      const perDozenPrice = option.perDozenPrice ?? option.basePrice;
      return total + perDozenPrice;
    }

    if (packageType === "large" || packageType === "xl") {
      const priceIncrease = option.largePriceIncrease > 0 ? option.largePriceIncrease : 0;
      return total + option.basePrice + priceIncrease;
    }

    // Small/medium (and fallback)
    return total + option.basePrice;
  }, 0);
};
```

**Pricing Logic Clarification**:

- Flat-rate options (Sprinkles, Gold/silver) without `perDozenPrice` will use `basePrice` for by-dozen orders
- Variable pricing options (Edible images, Wrapped) will use `perDozenPrice` when available for by-dozen orders
- For L/XL packages: If `largePriceIncrease > 0`, add it to `basePrice`; otherwise use `basePrice` only
- This ensures no design option incorrectly costs $0

### 12. Update PackageDetails Component

**File**: [`packages/web/src/components/PackageDetails/PackageDetails.tsx`](packages/web/src/components/PackageDetails/PackageDetails.tsx)

- Fetch additional design options using `useAdditionalDesignOptions()`
- Calculate additional designs total using utility function
- Display additional designs section showing selected options with individual prices
- Add additional designs total to final price calculation in `calculateTotal()`

### 13. Update ConfirmationPage

**File**: [`packages/web/src/pages/ConfirmationPage.tsx`](packages/web/src/pages/ConfirmationPage.tsx)

- Fetch additional design options using `useAdditionalDesignOptions()`
- Display selected additional designs by name (join IDs to names) - this is handled by `DesignDetails` component
- Price calculations are handled by `PackageDetails` component

**Note**: No direct changes needed here since `DesignDetails` and `PackageDetails` components handle the display and pricing.

### 15. Update Utility Functions

**File**: [`packages/web/src/utils/formSummaryUtils.ts`](packages/web/src/utils/formSummaryUtils.ts)

Update function signature to accept optional additional design options:

```typescript
export const getStepSummary = (
  stepId: string, 
  formData: FormData,
  additionalDesignOptions?: AdditionalDesignOptionDto[]
): string | null => {
  switch (stepId) {
    // keep all existing cases (lead, communication, package, by-dozen, color, event, pickup, default) as-is

    case "designs": {
      if (!formData.selectedAdditionalDesigns?.length) return null;
      if (!additionalDesignOptions) {
        return `${formData.selectedAdditionalDesigns.length} selected`;
      }

      // Map IDs to names; if an ID no longer has a matching option, mark it as unavailable
      const names = formData.selectedAdditionalDesigns.map((id) => {
        const match = additionalDesignOptions.find((opt) => opt.id === id);
        return match ? match.name : "Unavailable design";
      });

      return names.join(", ");
    }

    // ... existing cases like "pickup" and the default remain unchanged
  }
};
```

**File**: [`packages/web/src/utils/formStepUtils.ts`](packages/web/src/utils/formStepUtils.ts)

Update the "designs" case in `hasStepData`:

- Change from `!!formData.additionalDesigns` to `formData.selectedAdditionalDesigns?.length > 0`
- Arrays are always truthy, so check length instead

### 15a. Update FormSidebar and StepItem Components

**File**: [`packages/web/src/components/FormSidebar/FormSidebar.tsx`](packages/web/src/components/FormSidebar/FormSidebar.tsx)

- Fetch additional design options using `useAdditionalDesignOptions()` hook
- Pass options to `StepItem` components as a prop

**File**: [`packages/web/src/components/FormSidebar/StepItem.tsx`](packages/web/src/components/FormSidebar/StepItem.tsx)

- Accept `additionalDesignOptions` as optional prop
- Pass options to `getStepSummary()` when calling it

### 16. Update DesignDetails Component

**File**: [`packages/web/src/components/DesignDetails/DesignDetails.tsx`](packages/web/src/components/DesignDetails/DesignDetails.tsx)

- Fetch additional design options using `useAdditionalDesignOptions()`
- Replace `formData.additionalDesigns` check with `formData.selectedAdditionalDesigns?.length > 0`
- Map selected IDs to design names and display as comma-separated list
- Update label from "Additional Design Notes:" to "Additional Designs:"

## Testing

### 17. Update AdditionalDesigns Tests

**File**: [`packages/web/src/components/FormSteps/AdditionalDesigns.test.tsx`](packages/web/src/components/FormSteps/AdditionalDesigns.test.tsx)

- Mock `useAdditionalDesignOptions` hook
- Test checkbox rendering from API data
- Test multi-select functionality
- Test that selected IDs are passed to `updateFormData`
- Test loading and error states

### 18. Update Config Controller Tests

**File**: [`packages/api/test/integration/config/config.controller.spec.ts`](packages/api/test/integration/config/config.controller.spec.ts)

- Add test for `GET /config/additional-designs` endpoint
- Verify response structure matches `AdditionalDesignOptionDto[]`
- Test that only active options are returned
- Test sort order

### 19. Update Config Service Tests

**File**: [`packages/api/test/unit/config/config.service.spec.ts`](packages/api/test/unit/config/config.service.spec.ts)

- Add tests for `getAdditionalDesignOptions()` method
- Mock Prisma responses
- Test data transformation to DTO format
- Test filtering by `isActive: true`

### 20. Update useConfigQuery Tests

**File**: [`packages/web/src/hooks/useConfigQuery.test.ts`](packages/web/src/hooks/useConfigQuery.test.ts) (create if doesn't exist)

- Add tests for `useAdditionalDesignOptions` hook
- Mock `configApi.getAdditionalDesignOptions` method
- Test query key matches `['config', 'additional-designs']`
- Test that `configApi.getAdditionalDesignOptions` is called
- Test error handling
- Test `staleTime: Infinity` configuration

### 21. Update PackageDetails Tests

**File**: [`packages/web/src/components/PackageDetails/PackageDetails.test.tsx`](packages/web/src/components/PackageDetails/PackageDetails.test.tsx)

- Mock `useAdditionalDesignOptions` hook
- Test price calculation includes additional designs
- Test display of selected additional designs
- Test different package types (S/M vs L/XL vs by-dozen) affect pricing

### 22. Update ThankYouPage Tests

**File**: [`packages/web/src/pages/ThankYouPage.test.tsx`](packages/web/src/pages/ThankYouPage.test.tsx)

**Note**: No changes needed - ThankYouPage is out of scope for this work.

### 23. Update Utility Function Tests

**File**: [`packages/web/src/utils/formSummaryUtils.test.ts`](packages/web/src/utils/formSummaryUtils.test.ts)

- Update tests to use `selectedAdditionalDesigns: string[]` instead of `additionalDesigns: string`
- Mock additional design options and pass as third parameter to `getStepSummary`
- Test that empty array returns null
- Test that array of IDs maps to comma-separated names when options provided
- Test that array returns count string when options not provided (fallback behavior)

**File**: [`packages/web/src/utils/formStepUtils.test.ts`](packages/web/src/utils/formStepUtils.test.ts)

- Update tests to use `selectedAdditionalDesigns: string[]` instead of `additionalDesigns: string`
- Test that empty array returns false
- Test that array with items returns true

### 24. Update FormSidebar and StepItem Tests

**File**: [`packages/web/src/components/FormSidebar/FormSidebar.test.tsx`](packages/web/src/components/FormSidebar/FormSidebar.test.tsx)

- Mock `useAdditionalDesignOptions` hook
- Test that additional design options are fetched and passed to StepItem
- Test that StepItem receives options prop

**File**: [`packages/web/src/components/FormSidebar/StepItem.test.tsx`](packages/web/src/components/FormSidebar/StepItem.test.tsx) (create if doesn't exist)

- Test that StepItem passes additional design options to `getStepSummary`
- Test rendering with and without options provided
- Test that summary displays correctly when options are available

### 25. Update DesignDetails Tests

**File**: [`packages/web/src/components/DesignDetails/DesignDetails.test.tsx`](packages/web/src/components/DesignDetails/DesignDetails.test.tsx)

- Mock `useAdditionalDesignOptions` hook
- Update test data to use `selectedAdditionalDesigns: string[]`
- Test that selected design IDs are mapped to names and displayed
- Test that empty array doesn't render the section

## E2E Testing

### 26. Update E2E Spec

**File**: [`packages/e2e/tests/app.spec.ts`](packages/e2e/tests/app.spec.ts)

- Update AdditionalDesigns step to interact with checkboxes instead of textarea
- Select one or more options
- Verify selections appear on confirmation page
- Verify pricing includes additional design costs

## Commit Strategy

Following the repository's atomic commit standards, break this into logical commits:

1. **Database & types**: Schema, migration, seed data, shared types (including DTO export), FormData type update, FormDataDto validation update
2. **API layer**: Controller, service, FormsService updates (normalizeFormDataInput, buildJsonData, getFormMetadata, toFormDataFromRecord), tests
3. **Frontend API**: configApi method (add to object), useConfigQuery hook (with correct query key), tests
4. **Component updates**: AdditionalDesigns component (with checkbox implementation), tests
5. **Utility updates**: formSummaryUtils, formStepUtils, FormSidebar, StepItem, DesignDetails component, tests
6. **Price calculations**: Utility function (create priceCalculations.ts), PackageDetails, tests
7. **Confirmation pages**: ConfirmationPage (minimal - handled by child components), tests
8. **E2E tests**: Update app.spec.ts

Each commit should include both production code and tests, passing all quality gates (`yarn precommit`).

### To-dos

- [ ] Add AdditionalDesignOption model, create migration, seed with 4 complete options
- [ ] Add AdditionalDesignOptionDto to configTypes.ts and export from index.ts
- [ ] Update FormData type to use selectedAdditionalDesigns array
- [ ] Update FormDataDto validation (IsArray, IsString each)
- [ ] Update FormsService (normalizeFormDataInput, buildJsonData, getFormMetadata, toFormDataFromRecord)
- [ ] Add controller endpoint and service method with tests
- [ ] Add configApi.getAdditionalDesignOptions method (to configApi object) with tests
- [ ] Add useAdditionalDesignOptions hook (correct query key pattern) with tests
- [ ] Transform AdditionalDesigns to multi-select checkboxes (with checkbox UI pattern) with tests
- [ ] Create priceCalculations.ts utility function
- [ ] Update utility functions (formSummaryUtils, formStepUtils), FormSidebar, StepItem, and DesignDetails component with tests
- [ ] Update PackageDetails to use price calculation utility and display selected designs with tests
- [ ] Update ConfirmationPage (minimal changes) with tests
- [ ] Update E2E spec to use checkboxes instead of textarea