# Missing Environment Configuration

**Severity:** 2  
**File:** `packages/api/src/api.ts`

## Problem

The API uses hard-coded configuration values instead of environment-based configuration, making it difficult to deploy to different environments.

```typescript
// packages/api/src/api.ts:8
const PORT = 3001;
```

## Why It's Problematic

- Hard-coded configuration values
- No environment-specific settings
- Difficult to deploy to different environments
- Missing configuration validation
- Security risks from hard-coded values
- No support for different deployment scenarios
- Violates Twelve-Factor App principles

## Suggested Fix

Implement environment-based configuration with validation:

```typescript
// packages/api/src/config.ts
import { z } from 'zod';

const configSchema = z.object({
  PORT: z.string().transform(Number).default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  API_TIMEOUT: z.string().transform(Number).default('10000'),
  MAX_RETRIES: z.string().transform(Number).default('3'),
  DATABASE_URL: z.string().optional(), // For future database integration
  JWT_SECRET: z.string().optional(), // For future authentication
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX: z.string().transform(Number).default('100')
});

export const config = configSchema.parse(process.env);

// Validate required config for production
if (config.NODE_ENV === 'production') {
  if (!config.DATABASE_URL) {
    throw new Error('DATABASE_URL is required in production');
  }
  if (!config.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production');
  }
}

// packages/api/src/api.ts
import { config } from './config';

const app = express();
const PORT = config.PORT;

// Update CORS configuration
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));

// Add request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(config.API_TIMEOUT, () => {
    res.status(408).json({
      type: 'client',
      message: 'Request timeout',
      code: 'REQUEST_TIMEOUT'
    });
  });
  next();
});

// packages/api/src/index.ts
import { config } from './config';

app.listen(config.PORT, () => {
  console.log(`🚀 API server running on http://localhost:${config.PORT}`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`📊 Log level: ${config.LOG_LEVEL}`);
  console.log(`📊 Health check: http://localhost:${config.PORT}/api/health`);
  console.log(`📝 Form data API: http://localhost:${config.PORT}/api/form-data`);
});

// packages/api/.env.example
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
API_TIMEOUT=10000
MAX_RETRIES=3
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Production settings (uncomment and set for production)
# DATABASE_URL=postgresql://user:password@localhost:5432/sweetly_dipped
# JWT_SECRET=your-super-secret-jwt-key

// packages/api/src/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW,
  max: config.RATE_LIMIT_MAX,
  message: {
    type: 'client',
    message: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// packages/api/src/api.ts
import { apiLimiter } from './middleware/rate-limit';

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);
```

## Why This Helps

- Environment-specific configuration
- Validates configuration at startup
- Follows Twelve-Factor App principles
- Easier deployment and testing
- Better security with environment variables
- Supports different deployment scenarios
- Enables feature flags and environment-specific behavior
- Makes the application more maintainable and scalable
