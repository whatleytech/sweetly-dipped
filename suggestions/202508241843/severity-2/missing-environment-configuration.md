# Missing Environment Configuration

**Severity:** 2  
**File:** `src/api/formDataApi.ts`

## Problem

The API base URL is hardcoded for development:

```typescript
const API_BASE_URL = 'http://localhost:3001/api';
```

## Why It's Problematic

- Hardcoded development URL won't work in production
- No environment-specific configuration
- Missing fallback for different deployment environments
- Security risk if API endpoints change

## Suggested Fix

Use environment variables with fallback:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
```

And create a `.env` file for local development:

```env
# .env.local
VITE_API_BASE_URL=http://localhost:3001/api
```

For production, set the environment variable:

```env
# .env.production
VITE_API_BASE_URL=https://api.sweetlydipped.com/api
```

## Why This Helps

- Enables environment-specific configuration
- Supports different deployment environments
- Provides fallback for development
- Follows Vite environment variable conventions
