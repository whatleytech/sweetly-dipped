# Full Migration: Remove updateFormData

## Problem

The `updateFormData` function in `useFormData` hook is deprecated and should be removed. All code should migrate to using `persistFormProgress` directly, which provides a more consistent API for persisting form data changes.

## Solution Strategy

1. Remove `updateFormData` from `useFormData` hook entirely
2. Update `FormStepProps` interface to remove `updateFormData`
3. Create wrapper functions in consuming components where needed to maintain component interfaces
4. Update all tests to remove references to `updateFormData`

## Implementation Steps

### 1. Remove updateFormData from useFormData hook

**File**: `packages/web/src/hooks/useFormData.ts`

- Delete the `updateFormData` function (lines 131-154)
- Remove `updateFormData` from the return object (line 208)
- Update the hook's test file to remove `updateFormData` test

### 2. Update FormStepProps interface

**File**: `packages/web/src/types/formTypes.ts`

- Remove `updateFormData: (updates: Partial<FormData>) => void;` from `FormStepProps` interface (line 41)

### 3. Update ConfirmationPage

**File**: `packages/web/src/pages/ConfirmationPage.tsx`

- Remove `updateFormData` from hook destructuring (line 23)
- Create a local `handleUpdate` function that:
- Takes `updates: Partial<FormData>`
- Merges with current `formData`
- Calls `persistFormProgress({ formData: mergedData })` (async)
- Pass `handleUpdate` to sub-components instead of `updateFormData`

### 4. Update ConfirmationPage sub-components

**Files**:

- `packages/web/src/components/ContactInformation/ContactInformation.tsx`
- `packages/web/src/components/ReferralSource/ReferralSource.tsx`
- `packages/web/src/components/TermsAndConditions/TermsAndConditions.tsx`

**No changes needed** - these components already use the correct interface `onUpdate: (updates: Partial<FormData>) => void` and will receive the new wrapper from ConfirmationPage.

### 5. Update all component tests

**Files**: All test files that mock `updateFormData`

- `packages/web/src/hooks/useFormData.test.ts` - remove `updateFormData` test (lines 256-276)
- Form step component tests - these mock `updateFormData` for form step components, but since DesignPackagePage uses local state (`updateLocalFormData`), the mocks are fine as-is
- Confirmation page sub-component tests - verify they work with the callback pattern

## Testing Strategy

1. Run unit tests to ensure all mocks work correctly
2. Test ConfirmationPage manually to verify updates persist correctly
3. Verify form steps still work with local state updates in DesignPackagePage

## Expected Outcome

- `updateFormData` completely removed from codebase
- Single source of truth for persistence: `persistFormProgress`
- ConfirmationPage properly persists changes via wrapper function
- All tests passing with updated mocks
- Cleaner, more consistent API across the codebase
