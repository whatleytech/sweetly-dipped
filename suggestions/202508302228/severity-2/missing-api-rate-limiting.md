# Missing API Rate Limiting

**Severity:** 2  
**File:** `packages/api/src/api.ts`

## Problem

The API lacks rate limiting protection, making it vulnerable to abuse and potential DoS attacks.

```typescript
// packages/api/src/api.ts:11-12
app.use(cors());
app.use(express.json());
```

## Why It's Problematic

- No protection against abuse
- Potential for DoS attacks
- Missing request throttling
- No API usage monitoring
- Unfair resource consumption
- Security vulnerability
- No protection against automated attacks

## Suggested Fix

Implement comprehensive rate limiting middleware:

```typescript
// packages/api/src/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';
import { config } from '../config';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW, // 15 minutes
  max: config.RATE_LIMIT_MAX, // limit each IP to 100 requests per windowMs
  message: {
    type: 'client',
    message: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      type: 'client',
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(config.RATE_LIMIT_WINDOW / 1000)
    });
  }
});

// Stricter rate limiter for form creation
export const formCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 form creations per hour
  message: {
    type: 'client',
    message: 'Too many form creation attempts, please try again later',
    code: 'FORM_CREATION_LIMIT_EXCEEDED'
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// Rate limiter for health checks (more lenient)
export const healthCheckLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 health checks per minute
  message: {
    type: 'client',
    message: 'Too many health check requests',
    code: 'HEALTH_CHECK_LIMIT_EXCEEDED'
  }
});

// packages/api/src/api.ts
import { apiLimiter, formCreationLimiter, healthCheckLimiter } from './middleware/rate-limit';

// Apply general rate limiting to all API routes
app.use('/api/', apiLimiter);

// Apply stricter rate limiting to form creation
app.use('/api/form-data', formCreationLimiter);

// Apply specific rate limiting to health checks
app.use('/api/health', healthCheckLimiter);

// packages/api/src/middleware/security.ts
import helmet from 'helmet';

// Additional security middleware
export const securityMiddleware = [
  helmet(), // Security headers
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }),
  helmet.hidePoweredBy(), // Remove X-Powered-By header
  helmet.noSniff(), // Prevent MIME type sniffing
  helmet.xssFilter(), // XSS protection
];

// packages/api/src/api.ts
import { securityMiddleware } from './middleware/security';

// Apply security middleware
app.use(securityMiddleware);

// packages/api/src/middleware/request-logging.ts
import morgan from 'morgan';

// Request logging middleware
export const requestLogger = morgan('combined', {
  skip: (req, res) => res.statusCode < 400, // Only log errors in production
  stream: {
    write: (message) => {
      console.log(message.trim());
    }
  }
});

// packages/api/src/api.ts
import { requestLogger } from './middleware/request-logging';

// Apply request logging
app.use(requestLogger);
```

## Why This Helps

- Protects against abuse and DoS attacks
- Provides fair usage for all clients
- Enables API usage monitoring
- Follows security best practices
- Prevents resource exhaustion
- Improves application stability
- Enables better monitoring and alerting
- Protects against automated attacks and bots
