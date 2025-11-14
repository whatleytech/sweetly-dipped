# AGENTS.md - Sweetly Dipped Repository Guide

## Purpose & Scope

This document serves as the single source of truth for all AI agents working on the Sweetly Dipped repository. It consolidates established patterns, conventions, and operating principles to ensure consistent, high-quality development across the monorepo.

## Global Directives

**Do not affirm my statements or assume my conclusions are correct. Question assumptions, offer counterpoints, test reasoning. Prioritize truth over agreement.**

## Repository Conventions & Patterns

### Project Structure

This is a **Turborepo monorepo** with the following structure:

```
/
├── packages/
│   ├── web/          # React + Vite frontend
│   ├── api/          # NestJS backend with Prisma ORM
│   ├── deploy/       # Railway deployment scripts and configs
│   ├── shared-types/ # Shared TypeScript types
│   ├── config-eslint/ # Shared ESLint configuration
│   ├── config-ts/    # Shared TypeScript configuration
│   └── e2e/          # Playwright end-to-end tests
├── scripts/          # Build and utility scripts
├── coverage/         # Test coverage reports
└── .cursor/rules/    # Cursor rule files
```

### Package Manager & Node Version

- **Package Manager**: Yarn (Berry) - detected by `yarn.lock` and `.yarnrc.yml`
- **Node Version**: LTS (specified in `.nvmrc`)
- **Commands**: Use `yarn add`, `yarn add -D`, `yarn remove`, `yarn up <pkg>@latest`
- **Scripts**: Standardized across packages (`dev`, `build`, `test`, `lint`, `type-check`, `format`, `clean`)

### Frontend Architecture (packages/web)

#### Folder Structure
```
src/
├── assets/           # Static images, fonts, theme.css
├── components/       # Generic, reusable UI pieces
│   └── ComponentName/
│       ├── ComponentName.tsx
│       ├── ComponentName.test.tsx
│       └── ComponentName.module.css
├── features/         # Feature-centric folders (business logic)
├── pages/           # Route components (React Router)
├── hooks/           # Shared custom hooks
├── utils/           # Pure functions / helpers
├── api/             # API clients & data fetching
├── types/           # Shared type definitions
└── constants/       # Application constants
```

#### Key Patterns
- **Component Organization**: Each component gets its own folder with `.tsx`, `.test.tsx`, and `.module.css`
- **Business Logic**: Place in `features/` or `hooks/`, NOT in `components/`
- **Imports**: Use absolute imports with `@/` alias (configured in `tsconfig.json`)
- **CSS**: Component-specific CSS modules, no large shared stylesheets

#### Component Guidelines
- **Size Limit**: ≤ 250 LOC per component
- **Props**: Export typed props (`export type { ComponentProps }`)
- **Effects**: Maximum one `useEffect` per component (extract to hooks)
- **Responsibility**: Single responsibility principle

### Backend Architecture (packages/api)

#### Structure
```
src/
├── app.module.ts   # Root application module
├── main.ts         # Nest bootstrap entry point
├── forms/          # Feature module for form APIs
│   ├── forms.controller.ts
│   ├── forms.module.ts
│   └── forms.service.ts
├── orders/         # Feature module for order number API
├── health/         # Feature module for health checks
└── common/         # Shared providers, interceptors, pipes (create as needed)
```

#### Patterns
- **Modules**: Group feature domains; register controllers and providers
- **Controllers**: Surface HTTP routes via Nest decorators
- **Services**: Encapsulate business logic and state management
- **Providers**: Injected dependencies (services, repositories, pipes, guards)
- **Bootstrap**: Configure global middleware, filters, and prefixes in `main.ts`
- **Scaffolding**: Prefer the Nest CLI (`nest generate ...`) for creating new modules, controllers, and services to ensure consistent file structure and metadata ([docs.nestjs.com](https://docs.nestjs.com/cli/usages#nest-generate))
- **Database**: Prisma ORM for type-safe database access with PostgreSQL
- **Migrations**: Use `yarn db:migrate` for local, `yarn db:migrate:prod` for production

### TypeScript Configuration

#### Strict Mode Requirements
All packages must use strict TypeScript with these settings:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true
  }
}
```

#### Type Patterns
- **Interfaces**: For object shapes and component props
- **Types**: For unions, computed types, and primitive aliases
- **No `any`**: Use `unknown` or proper typing
- **Export Props**: Always export component prop interfaces

#### Path Aliases
```json
{
  "paths": {
    "@/*": ["src/*"],
    "@/components/*": ["src/components/*"],
    "@/pages/*": ["src/pages/*"],
    "@/types/*": ["src/types/*"],
    "@/utils/*": ["src/utils/*"],
    "@/hooks/*": ["src/hooks/*"],
    "@/api/*": ["src/api/*"],
    "@/constants/*": ["src/constants/*"],
    "@/assets/*": ["src/assets/*"]
  }
}
```

### Brand Colors & Design System

#### Color Palette
```css
--sd-brown-dark:   #4b2e2b   /* Chocolate coating */
--sd-brown-light:  #6b433f   /* Drip highlight */
--sd-pink-base:    #ff66a0   /* Logo text pink */
--sd-pink-light:   #ffe6f1   /* Background tint */
--sd-cream:        #fffaf6   /* Frosting / negative space */
--sd-white:        #ffffff   /* Pure white for highest contrast */
```

#### Implementation Rules
1. **Declare once**: In `src/assets/theme.css` and export from `src/types/colors.ts`
2. **Reference via CSS variables**: `color: var(--sd-pink-base);`
3. **No hard-coded HEX**: Prohibited outside theme files
4. **Accessibility**: Maintain ≥ 4.5:1 contrast for body text, ≥ 3:1 for headings
5. **Test coverage**: Include Vitest unit test for CSS variable definitions

### Testing Standards

#### Framework & Tools
- **Framework**: Vitest with React Testing Library
- **Location**: Colocate tests with source (`.test.ts[x]` suffix)
- **Mocking**: Mock external dependencies, APIs, localStorage

#### Coverage Thresholds
- **Components**: 95%
- **Pages**: 85%
- **Utils/Helpers**: 100%
- **Hooks**: 90%
- **API layers**: 80%

#### Test Requirements
- **Every file**: Must have corresponding test
- **User interactions**: Test clicks, form inputs, etc.
- **Error states**: Test edge cases and error handling
- **Accessibility**: Test ARIA attributes and keyboard navigation

#### Mobile Responsive Testing
**Required Breakpoints**:
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile Large: 481px - 767px
- Mobile Medium: 421px - 480px
- Mobile Small: 320px - 420px

**Testing Checklist**:
1. Test on iPhone 14 Pro Max (430px width)
2. Test on Pixel 7 (412px width)
3. Test on Samsung Galaxy S8+ (360px width)
4. Test on iPhone SE (375px width)
5. Verify no horizontal scrollbars
6. Confirm text readability
7. Check interactive element accessibility

### Accessibility Standards

#### Core Principles
1. **WCAG 2.1 AA Compliance**
2. **Progressive Enhancement**
3. **Semantic HTML First**
4. **Keyboard Accessible**
5. **Screen Reader Compatible**
6. **Color Independent**

#### Required ARIA Patterns
```tsx
// Buttons
<button 
  type="button"
  aria-label="Close dialog"
  aria-describedby="dialog-description"
>
  <CloseIcon aria-hidden="true" />
</button>

// Form inputs
<input
  type="text"
  id="username"
  aria-invalid={hasError}
  aria-describedby={hasError ? "username-error" : "username-help"}
  aria-required="true"
/>

// Live regions
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  className="sr-only"
>
  {statusMessage}
</div>
```

#### Keyboard Navigation
- **Logical tab order**: Follow visual layout
- **Skip links**: Provide skip to main content
- **Focus indicators**: Visible on all interactive elements
- **Tab trapping**: Within modals and overlays

### Error Handling Patterns

#### Core Principles
1. **Fail gracefully** - Never crash the application
2. **Provide clear feedback** - Users understand what went wrong
3. **Enable recovery** - Always provide a path forward
4. **Log comprehensively** - Capture context for debugging
5. **Test error paths** - Error handling must be tested

#### Error Boundary Implementation
```tsx
export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

#### API Error Handling
```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    const { status, data } = error.response;
    return new ApiError(
      data.message || `HTTP ${status} Error`,
      status,
      data.code,
      data.details
    );
  } else if (error.request) {
    return new ApiError(
      'Network error - please check your connection',
      0,
      'NETWORK_ERROR'
    );
  } else {
    return new ApiError(
      error.message || 'An unexpected error occurred',
      500,
      'UNKNOWN_ERROR'
    );
  }
};
```

### Form Validation Patterns

#### Client-Side Validation
```typescript
// Email validation
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Phone validation (US format)
const isValidPhone = (phone: string) => /^\d{3}-\d{3}-\d{4}$/.test(phone);

// Password validation
const isValidPassword = (password: string) => 
  password.length >= 8 && 
  /[A-Z]/.test(password) && 
  /[a-z]/.test(password) && 
  /\d/.test(password);
```

#### Error Message Standards
- **Required fields**: "This field is required"
- **Email**: "Please enter a valid email address"
- **Phone**: "Please enter a valid phone number (123-456-7890)"
- **Password**: "Password must be at least 8 characters with uppercase, lowercase, and number"

#### Form Error Display
```tsx
<div className={styles.fieldGroup}>
  <label htmlFor="input-id" className={styles.label}>
    Field Name {isRequired && "*"}
  </label>
  <input
    id="input-id"
    className={`${styles.input} ${hasError ? styles.inputError : ''}`}
    aria-invalid={hasError}
    aria-describedby={hasError ? "input-id-error" : undefined}
  />
  {hasError && (
    <div 
      id="input-id-error" 
      className={styles.errorMessage}
      role="alert"
      aria-live="polite"
    >
      {errorMessage}
    </div>
  )}
</div>
```

## Agent Operating Principles

### Development Workflow

#### TDD Approach
1. **Write tests first** - Scaffold or update tests before implementation
2. **Red state prevention** - Never leave repo in failing test state
3. **Test pyramid** - Lots of unit tests → handful of integration tests → smoke-level e2e test

#### Quality Gates
Before any commit, run this checklist:
```bash
yarn lint           # ESLint passes
yarn type-check     # TypeScript compiles
yarn test           # All tests green and coverage threshold met
yarn test:e2e       # E2E tests pass across all browsers
```

#### Commit Standards

**Commit Policy**:
- **One cohesive task per commit**
- **Keep diffs small**: ≤ 300 total lines changed
- **Ideal size**: 50-150 lines changed
- **Split large changes** into logical chunks

**Commit Message Format**:
```
<type>(scope): <subject>

[optional body]
```

**Type Prefixes**:
- `feat(scope):` - New feature or enhancement
- `fix(scope):` - Bug fix
- `chore(scope):` - Maintenance, deps, tooling
- `docs(scope):` - Documentation only
- `test(scope):` - Adding/updating tests only
- `refactor(scope):` - Code restructuring without feature changes
- `style(scope):` - Formatting, whitespace, code style

**Examples**:
✅ Good:
- `feat(lead): add email/phone validation with live formatting`
- `fix(sidebar): correct step progress calculation`
- `chore(deps): update react router to v6.8`

❌ Bad:
- `Updated some files` (no type/scope, not descriptive)
- `feat: added a new component for the form validation and phone number formatting with tests` (too long)
- `Fix bug.` (not descriptive, has period)

### Code Quality Standards

#### Component Guidelines
- **Single responsibility**: Each component does one thing well
- **Props interface**: Export typed props for reusability
- **CSS modules**: Component-specific styling
- **Accessibility**: ARIA attributes, keyboard navigation, screen reader support

#### Function Guidelines
- **Single purpose**: Do ONE thing
- **Size limit**: ≤ 40 LOC or break it up
- **Pure functions**: Extract reusable logic to utils
- **Error handling**: Always handle edge cases

#### TypeScript Standards
- **Strict mode**: All packages use strict TypeScript
- **No `any`**: Use `unknown` or proper typing
- **Explicit types**: All parameters and variables typed
- **Null safety**: Handle null/undefined explicitly

### Dependency Management

#### Library Selection
- **Prefer proven libraries** over custom code
- **Health evaluation**: ≥ 5k GitHub stars, recent commits (< 12 months)
- **Type safety**: Every dependency properly typed
- **Wrap third-party code** behind adapters when helpful

#### Package Manager Rules
- **Detect automatically**: Check for `yarn.lock` or `.yarnrc.yml`
- **Use consistently**: Never mix package managers
- **Yarn Berry**: Use `yarn dlx` for one-off CLIs
- **Workspace dependencies**: Use `workspace:*` for internal packages

### Testing Strategy

#### Test Organization
- **Colocate tests**: Next to source with `.test.ts[x]` suffix
- **Test files required**: Every new/modified file needs tests
- **Coverage thresholds**: Enforced per file type
- **Mocking strategy**: Mock external dependencies and APIs

#### Test Patterns
```tsx
// Component testing
test('renders with default props', () => {
  render(<Component />);
  expect(screen.getByText('Expected text')).toBeInTheDocument();
});

// User interaction testing
test('handles user input', async () => {
  const user = userEvent.setup();
  render(<Form />);
  
  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
});

// Error state testing
test('displays error message when validation fails', async () => {
  render(<Form />);
  
  await user.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText('This field is required')).toBeInTheDocument();
});
```

### Error Handling Strategy

#### Error Boundaries
- **Wrap entire app**: Prevent complete crashes
- **Feature boundaries**: Wrap feature components
- **Route boundaries**: Wrap individual routes
- **Fallback UI**: Always provide recovery options

#### API Error Handling
- **HTTP errors**: Handle different status codes
- **Network errors**: Provide offline feedback
- **Timeout handling**: Set reasonable timeouts
- **Retry mechanisms**: For transient failures

#### User Feedback
- **Clear messages**: Users understand what went wrong
- **Recovery actions**: Provide retry or alternative paths
- **Loading states**: Show progress during async operations
- **Validation feedback**: Real-time form validation

## Update & Maintenance Rules

### When to Edit AGENTS.md
- **New patterns**: When establishing new conventions
- **Breaking changes**: When changing established patterns
- **Tool updates**: When updating frameworks or tools
- **Process changes**: When modifying development workflow

### When to Create New Rule Files
- **Package-specific**: Rules that only apply to one package
- **Temporary**: Rules for migration or temporary patterns
- **Experimental**: Rules for testing new approaches
- **External tools**: Rules for third-party tool integration

### Rule File Management
- **Consolidate regularly**: Move common patterns to AGENTS.md
- **Delete redundant**: Remove rules that duplicate AGENTS.md content
- **Version control**: Track changes to rules over time
- **Documentation**: Keep rules up to date with implementation

### Quality Assurance
- **Review periodically**: Ensure rules match actual practice
- **Test rules**: Verify rules work as intended
- **Update examples**: Keep code examples current
- **Remove obsolete**: Delete outdated or unused rules
- **Use current dates**: Always use `date` command to get actual datetime when updating timestamps, never hardcode dates

## Deployment Architecture (packages/deploy)

### Railway Deployment Package

The `packages/deploy` workspace centralizes all Railway deployment automation, configurations, and documentation.

#### Structure
```
packages/deploy/
├── configs/
│   ├── railway.json          # Project-level Railway config
│   ├── api.railway.toml      # API service configuration
│   └── web.railway.toml      # Web service configuration
├── scripts/
│   ├── init-project.sh       # Initialize Railway project
│   ├── setup-services.sh     # Create services and database
│   ├── set-vars.sh           # Sync environment variables
│   ├── deploy-api.sh         # Deploy API + migrations
│   ├── deploy-web.sh         # Deploy web service
│   └── verify-deployment.sh  # Health check both services
├── .env.railway.example      # Template (safe placeholders)
├── .env.railway              # Actual URLs (gitignored)
├── .gitignore                # Protect secrets
├── package.json              # Scripts + Railway CLI
└── README.md                 # Deployment documentation
```

#### Deployment Workflow

**One-time setup**:
```bash
yarn deploy:init              # Railway login + project creation
yarn deploy:setup             # Create API, web, Postgres services
cp packages/deploy/.env.railway.example packages/deploy/.env.railway
```

**Deploy services**:
```bash
yarn deploy:vars              # Sync environment variables
yarn deploy:api               # Build + deploy API + migrations
# Update .env.railway with API URL
yarn deploy:vars              # Update web with API URL
yarn deploy:web               # Build + deploy web
# Update .env.railway with web URL
yarn deploy:vars              # Update API CORS with web URL
yarn deploy:verify            # Test both services
```

**Monitor**:
```bash
yarn logs:api:follow          # Watch API logs
yarn logs:web:follow          # Watch web logs
yarn railway:status           # Check service status
```

#### Security Principles

- **Never commit secrets**: `.env.railway` is gitignored
- **Template only**: `.env.railway.example` contains safe placeholders
- **Database credentials**: Managed by Railway via `${{Postgres.DATABASE_URL}}` reference
- **Service URLs**: Stored only in `.env.railway` (gitignored)
- **Railway variables**: Use `--skip-deploys` flag when setting variables to avoid unnecessary redeployments

#### Key Environment Variables

**API Service**:
- `RAILWAY_DOCKERFILE_PATH`: `packages/api/Dockerfile`
- `DATABASE_URL`: PostgreSQL connection string (public proxy for migrations)
- `NODE_ENV`: `production`
- `PORT`: `3001`
- `ALLOWED_ORIGINS`: Web service URL for CORS

**Web Service**:
- `RAILWAY_DOCKERFILE_PATH`: `packages/web/Dockerfile`
- `VITE_API_URL`: API URL with `/api` suffix (auto-added by script)
- `NODE_ENV`: `production`
- `PORT`: Injected by Railway (dynamic)

#### Docker Configuration

**API Dockerfile** (`packages/api/Dockerfile`):
- Multi-stage build (builder + production)
- Prisma client generated during build
- Migrations run post-deployment via `railway run`
- Listens on `0.0.0.0:${PORT}` for Railway's proxy

**Web Dockerfile** (`packages/web/Dockerfile`):
- Multi-stage build (builder + production)
- Vite build with `VITE_API_URL` build arg
- Serves static files via `serve` package
- Listens on `0.0.0.0:${PORT:-3000}` for Railway's dynamic port

#### Database Management

**Migrations**:
```bash
yarn db:migrate:prod          # Run Prisma migrations in production
```

**Seeding**:
```bash
yarn db:seed:prod             # Seed production database
```

**Connection**:
- Internal hostname: `postgres.railway.internal:5432` (service-to-service)
- Public proxy: `nozomi.proxy.rlwy.net:11794` (for migrations from CLI)
- Database name: `sweetly_dipped` (created manually via psql)

#### Deployment Best Practices

1. **Test locally first**: Always test Docker builds locally before deploying
2. **Deploy order**: API before web (web needs API URL)
3. **Update variables**: Run `yarn deploy:vars` after each URL change
4. **Verify deployments**: Always run `yarn deploy:verify` after deployments
5. **Monitor logs**: Use `yarn logs:api:follow` to watch for errors
6. **Database migrations**: Run automatically during API deployment
7. **Rollback strategy**: Redeploy previous commit if issues arise

#### Common Issues

**502 Bad Gateway**:
- Ensure service listens on `0.0.0.0:${PORT}`
- Check Dockerfile CMD uses `${PORT:-3000}` syntax
- Verify `RAILWAY_DOCKERFILE_PATH` is set correctly

**Database connection errors**:
- Use public proxy URL for CLI migrations (`nozomi.proxy.rlwy.net`)
- Verify `DATABASE_URL` points to `sweetly_dipped` database
- Check database service is running in Railway dashboard

**CORS errors**:
- Ensure `ALLOWED_ORIGINS` matches web URL exactly
- Re-run `yarn deploy:vars` after updating web URL
- Check API logs for CORS-related errors

---

**Last Updated**: November 2025  
**Maintainer**: Development Team  
**Review Cycle**: Quarterly
