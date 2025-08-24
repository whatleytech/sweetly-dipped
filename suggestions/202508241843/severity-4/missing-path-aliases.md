# Missing Path Aliases in TypeScript Configuration

**Severity:** 4  
**File:** `tsconfig.app.json`

## Problem

The TypeScript configuration is missing path mapping, forcing relative imports throughout the codebase:

```json
{
  "compilerOptions": {
    // Missing path mapping configuration
  },
  "include": ["src"]
}
```

This results in verbose relative imports like:
```tsx
import type { FormData } from "../../types/formTypes";
import { FormButtons, FormStepContainer } from "../shared";
```

## Why It's Problematic

- Forces relative imports throughout the codebase (e.g., `"../../types/formTypes"`)
- Makes refactoring difficult when moving files
- Reduces code readability with long import paths
- Doesn't follow modern TypeScript project conventions

## Suggested Fix

Add path mapping to `tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/pages/*": ["src/pages/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/api/*": ["src/api/*"]
    }
  },
  "include": ["src"]
}
```

This enables clean imports like:
```tsx
import type { FormData } from '@/types/formTypes';
import { FormButtons, FormStepContainer } from '@/components/shared';
```

## Why This Helps

- Enables clean imports like `import { FormData } from '@/types/formTypes'`
- Improves code maintainability and readability
- Makes refactoring safer and easier
- Follows modern TypeScript project standards
