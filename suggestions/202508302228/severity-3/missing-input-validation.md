# Missing Input Validation Middleware

**Severity:** 3  
**File:** `packages/api/src/controllers/form-data-controller.ts`

## Problem

The API controllers perform manual validation scattered across different endpoints, leading to inconsistent validation rules and potential security issues.

```typescript
// packages/api/src/controllers/form-data-controller.ts:58-62
const { formData, currentStep = 0 } = req.body;

if (!formData) {
  return res.status(400).json({ error: 'Form data is required' });
}
```

## Why It's Problematic

- Manual validation scattered across controllers
- No consistent validation rules
- Missing type safety for request bodies
- Risk of accepting invalid data
- Duplicate validation logic
- Difficult to maintain and update validation rules
- Potential security vulnerabilities from unvalidated input

## Suggested Fix

Implement centralized validation middleware using Zod:

```typescript
// packages/api/src/middleware/validation.ts
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../types/errors';

// Form data validation schema
const formDataSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, 'Phone must be in format 123-456-7890'),
  communicationMethod: z.enum(['email', 'phone', 'text']),
  packageType: z.enum(['small', 'medium', 'large', 'xl']),
  riceKrispies: z.number().int().min(0).max(20),
  oreos: z.number().int().min(0).max(20),
  pretzels: z.number().int().min(0).max(20),
  marshmallows: z.number().int().min(0).max(20),
  colorScheme: z.string().min(1, 'Color scheme is required'),
  eventType: z.string().min(1, 'Event type is required'),
  theme: z.string().min(1, 'Theme is required'),
  additionalDesigns: z.string().optional(),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  pickupTime: z.string().regex(/^\d{1,2}:\d{2}\s?(AM|PM)$/i, 'Invalid time format'),
  rushOrder: z.boolean(),
  referralSource: z.string().min(1, 'Referral source is required'),
  termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
  visitedSteps: z.array(z.string()).default(['lead'])
});

// Request validation schemas
const createFormDataSchema = z.object({
  formData: formDataSchema,
  currentStep: z.number().int().min(0).max(10).optional().default(0)
});

const updateFormDataSchema = z.object({
  formData: formDataSchema.partial().optional(),
  currentStep: z.number().int().min(0).max(10).optional(),
  orderNumber: z.string().optional()
});

const idParamSchema = z.object({
  id: z.string().min(1, 'Form ID is required')
});

// Generic validation middleware
export const validateRequest = (schema: z.ZodSchema, target: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req[target]);
      req[target] = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        next(new ValidationError('Validation failed', details));
      } else {
        next(error);
      }
    }
  };
};

// Specific validation middlewares
export const validateCreateFormData = validateRequest(createFormDataSchema);
export const validateUpdateFormData = validateRequest(updateFormDataSchema);
export const validateFormId = validateRequest(idParamSchema, 'params');

// packages/api/src/controllers/form-data-controller.ts
import { validateCreateFormData, validateUpdateFormData, validateFormId } from '../middleware/validation';

// Update routes to use validation middleware
router.post('/', validateCreateFormData, (req, res, next) => {
  try {
    const { formData, currentStep } = req.body; // Now validated and typed
    
    const id = `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const storedData: StoredFormData = {
      id,
      formData: deserializeFormData({ formData }).formData,
      currentStep: currentStep || 0,
      createdAt: now,
      updatedAt: now,
    };
    
    formDataStore.set(id, storedData);
    
    res.status(201).json({
      id,
      ...serializeFormData(storedData),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', validateFormId, (req, res, next) => {
  try {
    const { id } = req.params; // Now validated
    
    const data = formDataStore.get(id);
    if (!data) {
      throw new NotFoundError('Form data not found');
    }
    
    res.json(serializeFormData(data));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateFormId, validateUpdateFormData, (req, res, next) => {
  try {
    const { id } = req.params; // Now validated
    const { formData, currentStep, orderNumber } = req.body; // Now validated
    
    const existingData = formDataStore.get(id);
    if (!existingData) {
      throw new NotFoundError('Form data not found');
    }
    
    const updatedData: StoredFormData = {
      ...existingData,
      formData: formData ? deserializeFormData({ formData }).formData : existingData.formData,
      currentStep: currentStep !== undefined ? currentStep : existingData.currentStep,
      orderNumber: orderNumber !== undefined ? orderNumber : existingData.orderNumber,
      updatedAt: new Date().toISOString(),
    };
    
    formDataStore.set(id, updatedData);
    
    res.json(serializeFormData(updatedData));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', validateFormId, (req, res, next) => {
  try {
    const { id } = req.params; // Now validated
    
    if (!formDataStore.has(id)) {
      throw new NotFoundError('Form data not found');
    }
    
    formDataStore.delete(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
```

## Why This Helps

- Centralizes validation logic in one place
- Provides type safety for request bodies
- Consistent error messages for validation failures
- Reduces boilerplate in controllers
- Makes validation rules easy to maintain and update
- Prevents security vulnerabilities from unvalidated input
- Improves developer experience with better error messages
- Enables automatic API documentation generation
