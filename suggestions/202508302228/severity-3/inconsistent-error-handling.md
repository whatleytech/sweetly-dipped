# Inconsistent Error Handling in API Layer

**Severity:** 3  
**File:** `packages/api/src/controllers/form-data-controller.ts`

## Problem

The API controllers use generic error handling that doesn't provide structured error responses or proper logging context.

```typescript
// packages/api/src/controllers/form-data-controller.ts:67-72
} catch (error) {
  console.error('Error creating form data:', error);
  res.status(500).json({ error: 'Internal server error' });
}
```

## Why It's Problematic

- Generic error messages don't help with debugging
- No structured error response format
- Missing error logging with context
- Inconsistent error handling across controllers
- Difficult to distinguish between different error types
- Poor user experience with unhelpful error messages

## Suggested Fix

Create a centralized error handling middleware and structured error types:

```typescript
// packages/api/src/types/errors.ts
export interface ApiError {
  type: 'validation' | 'not-found' | 'server' | 'client';
  message: string;
  code?: string;
  details?: unknown;
  timestamp: string;
}

export class ValidationError extends Error {
  public type = 'validation' as const;
  public code = 'VALIDATION_ERROR';
  public details: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class NotFoundError extends Error {
  public type = 'not-found' as const;
  public code = 'NOT_FOUND';

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// packages/api/src/middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import type { ApiError } from '../types/errors';

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error with context
  console.error('API Error:', {
    message: error.message,
    name: error.name,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Handle known error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      type: 'validation',
      message: error.message,
      code: 'VALIDATION_ERROR',
      details: (error as any).details,
      timestamp: new Date().toISOString()
    } as ApiError);
  }

  if (error.name === 'NotFoundError') {
    return res.status(404).json({
      type: 'not-found',
      message: error.message,
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString()
    } as ApiError);
  }

  // Handle unknown errors
  res.status(500).json({
    type: 'server',
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  } as ApiError);
};

// packages/api/src/controllers/form-data-controller.ts
import { ValidationError, NotFoundError } from '../types/errors';

// Update the controller to use structured errors
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const data = formDataStore.get(id);
    
    if (!data) {
      throw new NotFoundError('Form data not found');
    }
    
    res.json(serializeFormData(data));
  } catch (error) {
    next(error);
  }
});

router.post('/', (req, res, next) => {
  try {
    const { formData, currentStep = 0 } = req.body;
    
    if (!formData) {
      throw new ValidationError('Form data is required');
    }
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      throw new ValidationError('Missing required fields', {
        required: ['firstName', 'lastName', 'email'],
        provided: Object.keys(formData)
      });
    }
    
    const id = `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const storedData: StoredFormData = {
      id,
      formData: deserializeFormData({ formData }).formData,
      currentStep,
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

// packages/api/src/api.ts
import { errorHandler } from './middleware/error-handler';

// Add error handler as the last middleware
app.use(errorHandler);
```

## Why This Helps

- Provides consistent error response format across all endpoints
- Improves debugging with structured logging and context
- Better user experience with meaningful error messages
- Follows REST API best practices for error handling
- Enables better error monitoring and alerting
- Makes error handling predictable and maintainable
- Supports internationalization of error messages
