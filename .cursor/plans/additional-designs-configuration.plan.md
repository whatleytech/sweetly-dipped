---
name: Additional Designs Configuration
overview: Transform AdditionalDesigns from free-text to multi-select checkboxes with API-driven options and dynamic pricing
todos:
  - id: commit-1-db-api
    content: "Commit 1: Add AdditionalDesignOption model, migration, seed, API endpoint + tests"
    status: completed
  - id: commit-2-frontend-api
    content: "Commit 2: Add configApi.getAdditionalDesignOptions + useAdditionalDesignOptions hook + tests"
    status: completed
  - id: commit-3-price-util
    content: "Commit 3: Add priceCalculations.ts utility with calculateAdditionalDesignsTotal + tests"
    status: completed
  - id: commit-4-compat-layer
    content: "Commit 4: Add selectedAdditionalDesigns field (keep additionalDesigns), update DTO/service for both"
    status: completed
  - id: commit-5-component
    content: "Commit 5: Transform AdditionalDesigns component to multi-select checkboxes + tests"
    status: in_progress
  - id: commit-6-utils-sidebar
    content: "Commit 6: Migrate formSummaryUtils, formStepUtils, FormSidebar, StepItem + tests"
    status: pending
  - id: commit-7-display
    content: "Commit 7: Migrate DesignDetails, PackageDetails display components + tests"
    status: pending
  - id: commit-8-e2e-cleanup
    content: "Commit 8: Update E2E tests, remove deprecated additionalDesigns field"
    status: pending
---

# Additional Designs Configuration

## Overview

Transform the AdditionalDesigns form step from a free-text field to a multi-select checkbox system backed by the config API, with dynamic pricing based on package size.

## Quality Gate Requirement

**Every commit MUST pass:**

```bash
yarn precommit
```

This runs: `yarn lint --force && yarn type-check --force && yarn test --force && yarn test:e2e --force` 

---

## Commit 1: Database, Shared Types, and API Endpoint

**Scope:** Non-breaking additions to database and API layer only.

### 1a. Add AdditionalDesignOption Model

**File**: `packages/api/prisma/schema.prisma`Add new model after `TreatOption`:

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

**Pricing Logic Summary:**

- **S/M packages**: Use `basePrice`
- **L/XL packages**: Use `basePrice + largePriceIncrease` (if > 0)
- **By-dozen orders**: Use `perDozenPrice` if set, else `basePrice`

### 1b. Create Migration

```bash
yarn workspace @sweetly-dipped/api db:migrate
```



### 1c. Add Seed Data

**File**: `packages/api/prisma/seed.ts`

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



### 1d. Add AdditionalDesignOptionDto

**File**: `packages/shared-types/configTypes.ts`

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

**File**: `packages/shared-types/index.ts` — Ensure exported (already uses `export *`).

### 1e. Add Config Service Method

**File**: `packages/api/src/config/config.service.ts`

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



### 1f. Add Config Controller Endpoint

**File**: `packages/api/src/config/config.controller.ts`

```typescript
@Get('additional-designs')
async getAdditionalDesigns(): Promise<AdditionalDesignOptionDto[]> {
  return this.configService.getAdditionalDesignOptions();
}
```



### 1g. Add API Tests

**File**: `packages/api/test/unit/config/config.service.spec.ts`

- Test `getAdditionalDesignOptions()` method
- Mock Prisma responses
- Test data transformation to DTO format
- Test filtering by `isActive: true`

**File**: `packages/api/test/integration/config/config.controller.spec.ts`

- Test `GET /config/additional-designs` endpoint
- Verify response structure matches `AdditionalDesignOptionDto[]`
- Test sort order

### Quality Gate Check

```bash
yarn precommit  # Must pass: lint, type-check, test, test:e2e
```

### Human Manual Validation

Provide a short description of what was done and brief manual testing instructions. Wait for a human to confirm functionality before proceeding to make a commit

### Commit Message

```javascript
feat(api): add AdditionalDesignOption model and config endpoint

- Add AdditionalDesignOption Prisma model with tiered pricing fields
- Create database migration
- Add seed data for 4 design options (Sprinkles, Gold/silver, Edible images, Wrapped)
- Add AdditionalDesignOptionDto to shared-types
- Add ConfigService.getAdditionalDesignOptions() method
- Add GET /config/additional-designs controller endpoint
- Add unit and integration tests
```

---

## Commit 2: Frontend API Layer

**Scope:** Non-breaking additions to frontend API client and hooks.

### 2a. Add configApi Method

**File**: `packages/web/src/api/configApi.ts`Add to the `configApi` object:

```typescript
async getAdditionalDesignOptions(): Promise<AdditionalDesignOptionDto[]> {
  return fetchConfig<AdditionalDesignOptionDto[]>('additional-designs');
},
```



### 2b. Add useAdditionalDesignOptions Hook

**File**: `packages/web/src/hooks/useConfigQuery.ts`

```typescript
export function useAdditionalDesignOptions() {
  return useQuery<AdditionalDesignOptionDto[]>({
    queryKey: ['config', 'additional-designs'],
    queryFn: () => configApi.getAdditionalDesignOptions(),
    staleTime: Infinity,
  });
}
```



### 2c. Add Tests

**File**: `packages/web/src/api/configApi.test.ts`

- Test `configApi.getAdditionalDesignOptions()` makes correct fetch call
- Test response parsing

**File**: `packages/web/src/hooks/useConfigQuery.test.ts` (create if needed)

- Test `useAdditionalDesignOptions` hook
- Mock `configApi.getAdditionalDesignOptions` method
- Test query key is `['config', 'additional-designs']`
- Test error handling
- Test `staleTime: Infinity` configuration

### Quality Gate Check

```bash
yarn precommit  # Must pass
```

### Human Manual Validation

Provide a short description of what was done and brief manual testing instructions. Wait for a human to confirm functionality before proceeding to make a commit

### Commit Message

```javascript
feat(web): add configApi.getAdditionalDesignOptions and hook

- Add getAdditionalDesignOptions method to configApi object
- Add useAdditionalDesignOptions hook with correct query key pattern
- Add tests for API method and hook
```

---

## Commit 3: Price Calculation Utility

**Scope:** Non-breaking addition of utility function for price calculations.

### 3a. Create priceCalculations.ts

**File**: `packages/web/src/utils/priceCalculations.ts`

```typescript
import type { AdditionalDesignOptionDto, FormData } from '@sweetly-dipped/shared-types';

/**
    * Calculates the display price for a single additional design option
    * based on the selected package type.
 */
export const calculateDesignOptionPrice = (
  option: AdditionalDesignOptionDto,
  packageType: FormData['packageType']
): number => {
  if (packageType === 'by-dozen') {
    return option.perDozenPrice ?? option.basePrice;
  }

  if (packageType === 'large' || packageType === 'xl') {
    return option.basePrice + (option.largePriceIncrease > 0 ? option.largePriceIncrease : 0);
  }

  // small, medium, or empty (show base price)
  return option.basePrice;
};

/**
    * Calculates the total price for all selected additional design options
    * based on the package type.
 */
export const calculateAdditionalDesignsTotal = (
  selectedDesignIds: string[],
  designOptions: AdditionalDesignOptionDto[],
  packageType: FormData['packageType']
): number => {
  return selectedDesignIds.reduce((total, id) => {
    const option = designOptions.find((opt) => opt.id === id);
    if (!option) return total;
    return total + calculateDesignOptionPrice(option, packageType);
  }, 0);
};
```



### 3b. Add Tests

**File**: `packages/web/src/utils/priceCalculations.test.ts`

- Test `calculateDesignOptionPrice` for all package types
- Test `calculateAdditionalDesignsTotal` with multiple selections
- Test fallback behavior (missing option, empty array)
- Test `perDozenPrice` fallback to `basePrice`
- Test `largePriceIncrease` only applied when > 0

### Quality Gate Check

```bash
yarn precommit  # Must pass
```

### Human Manual Validation

Provide a short description of what was done and brief manual testing instructions. Wait for a human to confirm functionality before proceeding to make a commit

### Commit Message

```javascript
feat(web): add priceCalculations utility for additional designs

- Add calculateDesignOptionPrice for single option pricing
- Add calculateAdditionalDesignsTotal for sum of selected designs
- Support tiered pricing: S/M (base), L/XL (+increase), by-dozen (perDozen or base)
- Add comprehensive test coverage
```

---

## Commit 4: Add Compatibility Layer (Both Fields)

**Scope:** Add `selectedAdditionalDesigns` field while keeping `additionalDesigns` for backward compatibility. This allows gradual migration.

### 4a. Update FormData Type

**File**: `packages/shared-types/formTypes.ts`Add new field (keep old field for now):

```typescript
export interface FormData {
  // ... existing fields ...
  
  // Design Details
  colorScheme: string;
  eventType: string;
  theme: string;
  additionalDesigns: string;           // Deprecated: will be removed
  selectedAdditionalDesigns: string[]; // NEW: Array of design option IDs
  
  // ... rest of fields ...
}
```



### 4b. Update FormDataDto

**File**: `packages/api/src/forms/dto/form-data.dto.ts`Add validation for new field (keep old field):

```typescript
@IsOptional()
@IsString()
additionalDesigns?: string | null;  // Deprecated: keep for now

@IsOptional()
@IsArray()
@IsString({ each: true })
selectedAdditionalDesigns?: string[] | null;  // NEW
```



### 4c. Update FormsService

**File**: `packages/api/src/forms/forms.service.ts`Update these methods to handle both fields:

1. **`normalizeFormDataInput()`**: Handle new array field
```typescript
selectedAdditionalDesigns: Array.isArray(data.selectedAdditionalDesigns)
  ? data.selectedAdditionalDesigns.filter((id): id is string => typeof id === 'string')
  : [],
```




2. **`buildJsonData()`**: Include new field
```typescript
selectedAdditionalDesigns: formData.selectedAdditionalDesigns,
additionalDesigns: formData.additionalDesigns, // Keep for backward compat
```




3. **`getFormMetadata()`**: Extract new array field
```typescript
interface FormMetadata {
  // ... existing fields
  selectedAdditionalDesigns: string[];
  additionalDesigns: string; // Keep for now
}

const toArrayField = (value: Prisma.JsonValue | undefined): string[] => {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  return [];
};

// Add to extraction:
selectedAdditionalDesigns: toArrayField(json.selectedAdditionalDesigns),
```




4. **`toFormDataFromRecord()`**: Map new field
```typescript
selectedAdditionalDesigns: metadata.selectedAdditionalDesigns,
```




### 4d. Update Frontend FormData Default

**File**: `packages/web/src/hooks/useFormData.ts` (or wherever initial state is defined)Add default value:

```typescript
selectedAdditionalDesigns: [],
```



### 4e. Update testUtils

**File**: `packages/web/src/utils/testUtils.ts`Add to mock form data:

```typescript
selectedAdditionalDesigns: [],
```



### 4f. Update All Test Files

Update all test files that use mock FormData to include `selectedAdditionalDesigns: []`:

- All component test files
- All page test files
- All hook test files
- All utility test files

### 4g. Add/Update API Tests

**File**: `packages/api/test/unit/forms/forms.service.spec.ts`

- Test that `selectedAdditionalDesigns` is correctly normalized
- Test that `buildJsonData` includes the new field

**File**: `packages/api/test/integration/forms/forms.controller.spec.ts`

- Test that form submission accepts `selectedAdditionalDesigns` array

### Quality Gate Check

```bash
yarn precommit  # Must pass
```

### Human Manual Validation

Provide a short description of what was done and brief manual testing instructions. Wait for a human to confirm functionality before proceeding to make a commit

### Commit Message

```javascript
feat(forms): add selectedAdditionalDesigns field for multi-select migration

- Add selectedAdditionalDesigns: string[] to FormData type
- Add validation to FormDataDto for new array field
- Update FormsService to normalize, build, and extract new field
- Update all test mocks to include new field with empty array default
- Keep additionalDesigns field for backward compatibility (deprecated)
```

---

## Commit 5: Transform AdditionalDesigns Component

**Scope:** Convert the AdditionalDesigns form step from textarea to multi-select checkboxes.

### 5a. Update AdditionalDesigns Component

**File**: `packages/web/src/components/FormSteps/AdditionalDesigns.tsx`

- Import and use `useAdditionalDesignOptions()` hook
- Show loading/error states (follow pattern from `ByTheDozen.tsx`)
- Render checkbox for each option with name and calculated price
- Handle checkbox toggle updating `selectedAdditionalDesigns` array
- Remove the textarea for `additionalDesigns`

**Checkbox Implementation:**

```typescript
const { data: options, isLoading, error } = useAdditionalDesignOptions();

const handleToggle = (optionId: string) => {
  const current = formData.selectedAdditionalDesigns ?? [];
  const updated = current.includes(optionId)
    ? current.filter((id) => id !== optionId)
    : [...current, optionId];
  updateFormData({ selectedAdditionalDesigns: updated });
};

// In render:
<div className={styles.checkboxGroup}>
  {options?.map((option) => {
    const isSelected = formData.selectedAdditionalDesigns?.includes(option.id) ?? false;
    const displayPrice = calculateDesignOptionPrice(option, formData.packageType);
    
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
          {option.name} — ${displayPrice}
        </span>
        {option.description && (
          <span className={styles.checkboxDescription}>{option.description}</span>
        )}
      </label>
    );
  })}
</div>
```



### 5b. Add/Update CSS Module

**File**: `packages/web/src/components/FormSteps/AdditionalDesigns.module.css`Add checkbox styling following project patterns.

### 5c. Update Component Tests

**File**: `packages/web/src/components/FormSteps/AdditionalDesigns.test.tsx`

- Mock `useAdditionalDesignOptions` hook
- Test checkbox rendering from API data
- Test multi-select functionality (toggle on/off)
- Test that selected IDs are passed to `updateFormData`
- Test loading state
- Test error state
- Test price display with different package types

### Quality Gate Check

```bash
yarn precommit  # Must pass
```

### Human Manual Validation

Provide a short description of what was done and brief manual testing instructions. Wait for a human to confirm functionality before proceeding to make a commit

### Commit Message

```javascript
feat(web): transform AdditionalDesigns to multi-select checkboxes

- Fetch options from config API using useAdditionalDesignOptions hook
- Render checkbox for each option with dynamic pricing
- Update selectedAdditionalDesigns array on toggle
- Add loading and error states
- Update CSS module with checkbox styling
- Update tests to verify new multi-select behavior
```

---

## Commit 6: Migrate Utility Functions and Sidebar

**Scope:** Update utility functions and sidebar to use new `selectedAdditionalDesigns` field.

### 6a. Update formStepUtils

**File**: `packages/web/src/utils/formStepUtils.ts`Update the "designs" case in `hasStepData`:

```typescript
case 'designs':
  // Changed from string check to array length check
  return (formData.selectedAdditionalDesigns?.length ?? 0) > 0;
```



### 6b. Update formSummaryUtils

**File**: `packages/web/src/utils/formSummaryUtils.ts`Update function signature and "designs" case:

```typescript
import type { AdditionalDesignOptionDto } from '@sweetly-dipped/shared-types';

export const getStepSummary = (
  stepId: string,
  formData: FormData,
  additionalDesignOptions?: AdditionalDesignOptionDto[]
): string | null => {
  switch (stepId) {
    // ... existing cases unchanged ...

    case 'designs': {
      const selected = formData.selectedAdditionalDesigns;
      if (!selected?.length) return null;
      
      if (!additionalDesignOptions?.length) {
        return `${selected.length} selected`;
      }

      const names = selected.map((id) => {
        const match = additionalDesignOptions.find((opt) => opt.id === id);
        return match ? match.name : 'Unknown';
      });

      return names.join(', ');
    }

    // ... rest unchanged ...
  }
};
```



### 6c. Update StepItem Component

**File**: `packages/web/src/components/FormSidebar/StepItem.tsx`Accept and pass additional design options:

```typescript
interface StepItemProps {
  // ... existing props
  additionalDesignOptions?: AdditionalDesignOptionDto[];
}

// Pass to getStepSummary:
const summary = getStepSummary(step.id, formData, additionalDesignOptions);
```



### 6d. Update FormSidebar Component

**File**: `packages/web/src/components/FormSidebar/FormSidebar.tsx`Fetch options and pass to StepItem:

```typescript
const { data: additionalDesignOptions } = useAdditionalDesignOptions();

// Pass to each StepItem:
<StepItem
  // ... existing props
  additionalDesignOptions={additionalDesignOptions}
/>
```



### 6e. Update Tests

**File**: `packages/web/src/utils/formStepUtils.test.ts`

- Update tests to use `selectedAdditionalDesigns: string[]`
- Test empty array returns false
- Test array with items returns true

**File**: `packages/web/src/utils/formSummaryUtils.test.ts`

- Update tests to use `selectedAdditionalDesigns: string[]`
- Test with additionalDesignOptions parameter
- Test fallback count display without options
- Test ID-to-name mapping

**File**: `packages/web/src/components/FormSidebar/FormSidebar.test.tsx`

- Mock `useAdditionalDesignOptions` hook
- Test options are passed to StepItem

**File**: `packages/web/src/components/FormSidebar/StepItem.test.tsx` (create if needed)

- Test StepItem passes options to `getStepSummary`
- Test summary display

### Quality Gate Check

```bash
yarn precommit  # Must pass
```

### Human Manual Validation

Provide a short description of what was done and brief manual testing instructions. Wait for a human to confirm functionality before proceeding to make a commit

### Commit Message

```javascript
refactor(web): migrate sidebar and utils to selectedAdditionalDesigns

- Update formStepUtils.hasStepData to check array length
- Update formSummaryUtils.getStepSummary to accept design options param
- Update StepItem to receive and pass additional design options
- Update FormSidebar to fetch and provide design options
- Update all related tests
```

---

## Commit 7: Migrate Display Components

**Scope:** Update DesignDetails and PackageDetails to use new field and pricing.

### 7a. Update DesignDetails Component

**File**: `packages/web/src/components/DesignDetails/DesignDetails.tsx`

- Fetch additional design options using `useAdditionalDesignOptions()`
- Replace `formData.additionalDesigns` check with `formData.selectedAdditionalDesigns?.length > 0`
- Map selected IDs to design names
- Update label from "Additional Design Notes:" to "Additional Designs:"
```typescript
const { data: designOptions } = useAdditionalDesignOptions();

// Display selected designs by name:
const selectedNames = formData.selectedAdditionalDesigns
  ?.map((id) => designOptions?.find((opt) => opt.id === id)?.name)
  .filter(Boolean)
  .join(', ');

{selectedNames && (
  <div className={styles.detailRow}>
    <span className={styles.label}>Additional Designs:</span>
    <span className={styles.value}>{selectedNames}</span>
  </div>
)}
```




### 7b. Update PackageDetails Component

**File**: `packages/web/src/components/PackageDetails/PackageDetails.tsx`

- Fetch additional design options using `useAdditionalDesignOptions()`
- Calculate additional designs total using `calculateAdditionalDesignsTotal()`
- Display additional designs section with individual prices
- Add additional designs total to final price calculation
```typescript
const { data: designOptions } = useAdditionalDesignOptions();

const additionalDesignsTotal = calculateAdditionalDesignsTotal(
  formData.selectedAdditionalDesigns ?? [],
  designOptions ?? [],
  formData.packageType
);

// Add to total calculation:
const finalTotal = basePrice + treatTotal + additionalDesignsTotal;

// Display line item:
{additionalDesignsTotal > 0 && (
  <div className={styles.priceRow}>
    <span>Additional Designs</span>
    <span>${additionalDesignsTotal}</span>
  </div>
)}
```




### 7c. Update ConfirmationPage (if needed)

**File**: `packages/web/src/pages/ConfirmationPage.tsx`Verify that DesignDetails and PackageDetails handle display. No direct changes expected since child components handle rendering.

### 7d. Update Tests

**File**: `packages/web/src/components/DesignDetails/DesignDetails.test.tsx`

- Mock `useAdditionalDesignOptions` hook
- Update test data to use `selectedAdditionalDesigns: string[]`
- Test that selected design IDs are mapped to names
- Test empty array doesn't render section

**File**: `packages/web/src/components/PackageDetails/PackageDetails.test.tsx`

- Mock `useAdditionalDesignOptions` hook
- Test price calculation includes additional designs total
- Test different package types affect pricing (S/M vs L/XL vs by-dozen)
- Test display of additional designs line item

### Quality Gate Check

```bash
yarn precommit  # Must pass
```

### Human Manual Validation

Provide a short description of what was done and brief manual testing instructions. Wait for a human to confirm functionality before proceeding to make a commit

### Commit Message

```javascript
feat(web): update display components to show selected additional designs

- Update DesignDetails to display selected design names from API
- Update PackageDetails to calculate and show additional designs pricing
- Use calculateAdditionalDesignsTotal utility for consistent pricing
- Update tests with mock hooks and new field structure
```

---

## Commit 8: E2E Tests and Cleanup

**Scope:** Update E2E tests, remove deprecated `additionalDesigns` field, final cleanup.

### 8a. Update E2E Spec

**File**: `packages/e2e/tests/app.spec.ts`

- Update AdditionalDesigns step to interact with checkboxes instead of textarea
- Select one or more design options
- Verify selections appear on confirmation page
- Verify pricing includes additional design costs
```typescript
// Instead of typing in textarea:
// await page.fill('[data-testid="additional-designs-textarea"]', 'Custom text');

// Click checkboxes:
await page.click('text=Sprinkles');
await page.click('text=Gold or silver painted');

// Verify on confirmation:
await expect(page.locator('text=Sprinkles')).toBeVisible();
await expect(page.locator('text=Gold or silver painted')).toBeVisible();
```




### 8b. Remove Deprecated Field

**File**: `packages/shared-types/formTypes.ts`Remove the deprecated field:

```typescript
export interface FormData {
  // ... other fields ...
  
  // Design Details
  colorScheme: string;
  eventType: string;
  theme: string;
  // REMOVED: additionalDesigns: string;
  selectedAdditionalDesigns: string[];
  
  // ... rest of fields ...
}
```



### 8c. Update FormDataDto

**File**: `packages/api/src/forms/dto/form-data.dto.ts`Remove the deprecated validation:

```typescript
// REMOVE these lines:
// @IsOptional()
// @IsString()
// additionalDesigns?: string | null;
```



### 8d. Update FormsService

**File**: `packages/api/src/forms/forms.service.ts`Remove references to `additionalDesigns` from:

- `normalizeFormDataInput()` - remove additionalDesigns line
- `buildJsonData()` - remove additionalDesigns line
- `getFormMetadata()` - remove from interface and extraction
- `toFormDataFromRecord()` - remove additionalDesigns mapping

### 8e. Update All Test Mocks

Remove `additionalDesigns: ''` from all test files and mock data:

- All component tests
- All page tests
- All hook tests
- All utility tests
- API tests

### 8f. Final Verification

Run all quality gates one final time:

```bash
yarn precommit  # Must pass all: lint, type-check, test, test:e2e
```

### Human Manual Validation

Provide a short description of what was done and brief manual testing instructions. Wait for a human to confirm functionality before proceeding to make a commit

### Commit Message

```javascript
chore(forms): remove deprecated additionalDesigns field, update E2E tests

- Update E2E tests to use checkbox interactions instead of textarea
- Remove additionalDesigns field from FormData type
- Remove validation from FormDataDto
- Remove handling from FormsService methods
- Clean up all test mocks to remove deprecated field

BREAKING CHANGE: additionalDesigns field replaced by selectedAdditionalDesigns
```

---

## Summary: 8 Atomic Commits

| # | Scope | Type | Breaking? ||---|-------|------|-----------|| 1 | DB + API endpoint + shared types | feat | No || 2 | Frontend API client + hook | feat | No || 3 | Price calculation utility | feat | No || 4 | Add new field (compatibility) | feat | No || 5 | Transform component UI | feat | No || 6 | Migrate utilities + sidebar | refactor | No || 7 | Migrate display components | feat | No || 8 | E2E + cleanup deprecated field | chore | Yes |**Key Principles:**

1. Each commit passes `yarn precommit` (lint, type-check, test, test:e2e)
2. A human validates each commit
2. New field added before old field removed (compatibility layer)
3. Tests updated in same commit as implementation changes
4. Breaking change deferred to final commit

---

## Implementation Order Checklist

Before starting each commit:

- [ ] Understand the scope completely
- [ ] Identify all files that need changes

Before making each commit:
- [ ] Request human validation

After each commit:

- [ ] Run `yarn precommit`
- [ ] Verify all tests pass