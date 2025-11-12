# Defer Form Saves to Navigation

## Problem

Every form input change triggers a network call via `updateFormData`, overloading the server. We need to batch updates and save only on navigation events.

## Solution Strategy

1. Keep form data in local React state for instant UI updates.
2. Sync to the server only when navigating (forward/back buttons or sidebar clicks).
3. Consolidate multiple update helpers in `useFormData` into a single batched update.
4. Remove the debug “Fill in form” button.

## Implementation Steps

### 1. Consolidate `useFormData` update helpers

**File**: `packages/web/src/hooks/useFormData.ts`

- Replace the separate `updateFormData` and `updateCurrentStep` helpers with one method, e.g. `persistFormProgress({ formData?, currentStep?, orderNumber? })`.
- Keep the existing mutation logic but ensure the new helper triggers a single API call for any combination of updates.

### 2. Add local state management to `DesignPackagePage`

**File**: `packages/web/src/pages/DesignPackagePage.tsx`

- Introduce local state to hold the in-progress `FormData`.
- Initialize the local state from server data once loaded.
- Replace usages of the server-saving `updateFormData` with a local updater that only mutates React state.

### 3. Batch saves in navigation handlers

**File**: `packages/web/src/pages/DesignPackagePage.tsx`

- Update `nextStep` and `prevStep` to compute the next step index, updated visited steps, and current form data.
- Call `persistFormProgress` once per navigation with the batched payload.

### 4. Update sidebar navigation

**File**: `packages/web/src/components/FormSidebar/FormSidebar.tsx`

- Adjust the click handler to trigger the same batched save before changing steps.
- Change the prop from `setCurrentStep` to a new handler that accepts the desired step and performs the batched save.
- Wire this new handler from `DesignPackagePage`.

### 5. Remove the debug button

**File**: `packages/web/src/pages/DesignPackagePage.tsx`

- Delete the “Fill in form” button that bypasses the new save workflow.

### 6. Update tests

**Files**: `packages/web/src/pages/DesignPackagePage.test.tsx`, `packages/web/src/components/FormSteps/*.test.tsx`, `packages/web/src/components/FormSidebar/FormSidebar.test.tsx`

- Adjust mocks and expectations so form data functions mutate local state and only persist during navigation events.
- Add coverage to confirm batched saves are triggered when navigating via buttons or sidebar.

## Expected Outcome

- Server load drops dramatically (one save per navigation action).
- Users still see instant updates because local state handles input changes.
- Consolidated helper reduces duplication and simplifies persistence logic.