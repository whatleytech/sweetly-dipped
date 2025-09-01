# Playwright E2E Testing Setup

This document summarizes the Playwright end-to-end testing setup for the Sweetly Dipped monorepo.

## Overview

Playwright has been successfully integrated into the monorepo following best practices for Turborepo projects. The setup includes:

- **Dedicated e2e package** (`packages/e2e`) for all end-to-end tests
- **Multiple browser support** (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)
- **Monorepo integration** with proper workspace dependencies
- **Dual configuration** for setup tests and full application tests
- **CI/CD ready** with proper retry logic and reporting

## Package Structure

```
packages/e2e/
├── package.json              # E2E package configuration
├── tsconfig.json            # TypeScript configuration
├── playwright.config.ts     # Main Playwright configuration (with web servers)
├── playwright.api-only.config.ts # API-only configuration
├── tests/
│   ├── example.spec.ts      # Example application tests
│   ├── app.spec.ts          # Comprehensive application tests
│   └── api.spec.ts          # API-specific tests
└── README.md                # Detailed usage instructions
```

## Configuration Files

### Main Configuration (`playwright.config.ts`)
- **Web servers**: Automatically starts API and web servers
- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Browsers**: Desktop (Chrome, Firefox, Safari) + Mobile (Chrome, Safari)
- **Features**: Screenshots, videos, traces on failure
- **CI/CD**: Retry logic, parallel execution settings

### API-Only Configuration (`playwright.api-only.config.ts`)
- **API server only**: Starts only the API server
- **Single browser**: Chromium only for faster execution
- **Test matching**: Only runs `api.spec.ts` files
- **API testing**: Focused on backend API endpoints

## Available Commands

### From Root Directory
```bash
# Run all e2e tests (requires servers)
yarn test:e2e

# Run with UI mode
yarn test:e2e:ui

# Run in headed mode (see browser)
yarn test:e2e:headed

# Run in debug mode
yarn test:e2e:debug
```

### From E2E Package Directory
```bash
cd packages/e2e

# Run all tests
yarn test

# Run API tests only
yarn test:api

# Run with UI mode
yarn test:ui

# Run in headed mode
yarn test:headed

# Run in debug mode
yarn test:debug

# Generate tests with codegen
yarn test:codegen

# Show test report
yarn test:show-report
```

## Test Structure

### Application Tests (`tests/app.spec.ts`)
- **Full workflow**: Tests complete user journeys
- **API integration**: Tests both frontend and backend
- **Mobile responsiveness**: Tests on mobile viewports
- **Accessibility**: Tests ARIA attributes and keyboard navigation

### Example Tests (`tests/example.spec.ts`)
- **Basic examples**: Simple page navigation tests
- **Form elements**: Tests form accessibility
- **Hero section**: Tests main page components

## Browser Support

### Desktop Browsers
- **Chromium**: Primary browser for testing
- **Firefox**: Cross-browser compatibility
- **WebKit**: Safari compatibility

### Mobile Browsers
- **Mobile Chrome**: Pixel 5 viewport (393x851)
- **Mobile Safari**: iPhone 12 viewport (390x844)

## Features

### Automatic Web Server Management
- **API server**: Starts on `http://localhost:3000`
- **Web server**: Starts on `http://localhost:5173`
- **Health checks**: Waits for servers to be ready
- **Reuse existing**: Uses running servers when available

### Test Artifacts
- **Screenshots**: Captured on test failures
- **Videos**: Recorded on test failures
- **Traces**: Generated for debugging
- **HTML reports**: Interactive test reports

### CI/CD Integration
- **Retry logic**: 2 retries on CI
- **Parallel execution**: Configurable worker count
- **Fail fast**: Stops on `test.only` in CI
- **Cache friendly**: Works with Turborepo caching

## Best Practices Implemented

### Monorepo Integration
- **Workspace dependencies**: Uses `workspace:*` for internal packages
- **Shared TypeScript config**: Extends `@sweetly-dipped/config-ts`
- **Turborepo tasks**: Proper task definitions and dependencies
- **Package isolation**: E2E tests in dedicated package

### Test Organization
- **Semantic selectors**: Uses `getByRole`, `getByLabel`, `getByText`
- **User workflows**: Focuses on complete user journeys
- **Mobile-first**: Tests mobile responsiveness
- **Accessibility**: Tests with screen readers and keyboard navigation

### Error Handling
- **Graceful failures**: Tests handle server unavailability
- **Clear error messages**: Descriptive test failures
- **Debugging support**: Traces and screenshots for failures
- **Recovery options**: Multiple test configurations

## Next Steps

1. **Write comprehensive tests**: Add tests for all user workflows
2. **API testing**: Expand API endpoint testing
3. **Visual regression**: Add visual comparison tests
4. **Performance testing**: Add performance benchmarks
5. **Accessibility testing**: Expand accessibility test coverage

## Troubleshooting

### Common Issues

**Servers not starting**:
- Check if ports 3000 and 5173 are available
- Verify package names in `turbo.json`
- Check for TypeScript errors in web/api packages

**Tests timing out**:
- Increase timeout in `playwright.config.ts`
- Check server startup logs
- Verify health check endpoints

**Browser issues**:
- Run `yarn playwright install` to reinstall browsers
- Check browser compatibility
- Verify viewport settings

### Debug Commands

```bash
# Install/reinstall browsers
yarn playwright install

# Run with debug output
yarn test:e2e:debug

# Generate test code
yarn test:codegen

# View test report
yarn test:show-report
```

## References

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Turborepo Best Practices](https://monorepo.tools/)
- [Monorepo Testing Strategies](https://turborepo.com/docs/core-concepts/testing)
