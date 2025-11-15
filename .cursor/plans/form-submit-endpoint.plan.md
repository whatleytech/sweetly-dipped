# Form Submit Endpoint Migration

## Overview

Transform the order creation flow from a two-step process (generate order number → update form) into a single atomic operation via `POST /forms/:id/submit`. Order numbers will use format `YYYYMMDD-<random-12-char-hash>` instead of sequential counters.

## Backend Changes

### 1. Database Schema

**File**: `packages/api/prisma/schema.prisma`

Add `status` and `submittedAt` fields to the `Form` model:

```prisma
model Form {
  // ... existing fields ...
  status      String    @default("draft")  // "draft" | "submitted"
  submittedAt DateTime? @map("submitted_at")
  // ... rest of fields ...
}
```

Push schema changes: `yarn workspace @sweetly-dipped/api db:push`

### 2. Create Submit DTO

**File**: `packages/api/src/forms/dto/submit-form.dto.ts` (new file)

```typescript
export interface SubmitFormDto {
  orderNumber: string;
  submittedAt: string;
}
```

### 3. Update StoredFormDto

**File**: `packages/api/src/forms/dto/stored-form.dto.ts`

Add `status` and `submittedAt` fields to the interface.

### 4. FormsService - Add Submit Method

**File**: `packages/api/src/forms/forms.service.ts`

Add helper function to generate order numbers:

```typescript
const generateOrderNumber = (): string => {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0].replace(/-/g, '');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const hash = Array.from({ length: 12 }, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
  return `${dateString}-${hash}`;
};
```

Add new `submit()` method that:

- Validates form exists and is in draft status
- Validates customer exists (required for orders)
- Generates order number using the hash format
- Creates Order record
- Updates form status to "submitted" with timestamp
- Returns submitted form details

Key logic:

```typescript
async submit(id: string): Promise<SubmitFormDto> {
  // 1. Fetch form with customer/order relations
  // 2. Validate form is in draft status
  // 3. Validate customer exists (throw BadRequestException if not)
  // 4. Generate order number with random hash
  // 5. Create order record
  // 6. Update form status to "submitted" with submittedAt timestamp
  // 7. Return order details
}
```

### 5. FormsController - Add Submit Endpoint

**File**: `packages/api/src/forms/forms.controller.ts`

```typescript
@Post(':id/submit')
submit(@Param('id') id: string): Promise<SubmitFormDto> {
  return this.formsService.submit(id);
}
```

### 6. Update FormsService Mapping

**File**: `packages/api/src/forms/forms.service.ts`

Update `mapFormToStoredDto()` to include the new `status` and `submittedAt` fields from the database.

### 7. Remove Orders Module

Delete the following files and directories:

- `packages/api/src/orders/` (entire directory including controller, service, module, dto)

### 8. Update App Module

**File**: `packages/api/src/app.module.ts`

Remove `OrdersModule` import and registration.

## Frontend Changes

### 9. Update API Client

**File**: `packages/web/src/api/formDataApi.ts`

Replace `generateOrderNumber()` method with:

```typescript
async submitForm(formId: string): Promise<{ orderNumber: string; submittedAt: string }> {
  const response = await fetchWithRetry(`${API_BASE_URL}/forms/${formId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse<{ orderNumber: string; submittedAt: string }>(response);
}
```

### 10. Update useFormData Hook

**File**: `packages/web/src/hooks/useFormData.ts`

Replace `updateOrderNumber()` with:

```typescript
const submitForm = useCallback(async (): Promise<{ orderNumber: string; submittedAt: string }> => {
  if (!formId) {
    throw new Error('No form ID available');
  }
  return await formDataApi.submitForm(formId);
}, [formId]);
```

Export `submitForm` instead of `updateOrderNumber`.

### 11. Update ConfirmationPage

**File**: `packages/web/src/pages/ConfirmationPage.tsx`

Update `handleSubmit()` to use the new flow:

```typescript
const handleSubmit = async () => {
  if (!formData?.termsAccepted) {
    alert("Please accept the terms and conditions to continue.");
    return;
  }

  try {
    await submitForm();  // Single call that does everything
    navigate("/thank-you");
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("There was an error submitting your order. Please try again.");
  }
};
```

Replace `updateOrderNumber` with `submitForm` in the destructured hook return.

## Testing Updates

### 12. Backend Tests

- Update `forms.service.spec.ts` - Add tests for new `submit()` method
- Update `forms.controller.spec.ts` - Add tests for new submit endpoint
- Update existing tests to handle new `status` and `submittedAt` fields
- Remove tests for OrdersController/OrdersService

### 13. Frontend Tests

- Update `formDataApi.test.ts` - Replace order number generation tests with submit tests
- Update `useFormData.test.ts` - Replace updateOrderNumber tests with submitForm tests
- Update `ConfirmationPage.test.tsx` - Update to use new submit flow

## Implementation Strategy

1. Push database schema changes with `db:push`
2. Update backend (new submit endpoint)
3. Remove old orders module and endpoints
4. Update frontend to use new submit endpoint
5. Update all tests

## Key Benefits

- **Atomic operation**: Order creation is all-or-nothing
- **Better error handling**: Single point of failure vs multiple steps
- **Cleaner API**: RESTful resource-based endpoint
- **Data integrity**: Form can't have order number without order record
- **Status tracking**: Clear distinction between draft and submitted forms
- **Simpler order numbers**: No need for OrderCounter model or sequential logic
- **Collision-resistant**: 12-character alphanumeric hash provides sufficient uniqueness
