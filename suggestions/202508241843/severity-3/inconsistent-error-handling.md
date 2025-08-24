# Inconsistent Error Handling in API Layer

**Severity:** 3  
**File:** `src/api/formDataApi.ts`

## Problem

The API error handling is generic and doesn't provide actionable feedback:

```typescript
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: 'Unknown error' };
    }
    
    throw new FormDataApiError(
      errorData.error || `HTTP ${response.status}`,
      response.status
    );
  }
  
  const data = await response.json();
  return deserializeApiResponse(data);
}
```

## Why It's Problematic

- Generic error messages don't provide actionable feedback
- No retry logic for transient failures
- Missing timeout handling for slow requests
- Error types aren't discriminated for different failure scenarios

## Suggested Fix

Implement structured error handling with specific error types:

```typescript
interface ApiError {
  type: 'network' | 'validation' | 'server' | 'not-found';
  message: string;
  status?: number;
  retryable?: boolean;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = {
      type: response.status >= 500 ? 'server' : 
            response.status === 404 ? 'not-found' : 'validation',
      message: `Request failed: ${response.status}`,
      status: response.status,
      retryable: response.status >= 500
    };
    
    try {
      const errorData = await response.json();
      error.message = errorData.error || error.message;
    } catch {
      // Keep default error message
    }
    
    throw new FormDataApiError(error.message, response.status);
  }
  
  const data = await response.json();
  return deserializeApiResponse(data);
}
```

## Why This Helps

- Provides specific error types for better error handling
- Enables retry logic for server errors
- Gives more actionable error messages
- Improves debugging and user experience
