# E2E Testing Package

This package contains end-to-end tests for the Sweetly Dipped application using Playwright.

## Setup

The package is already configured with Playwright and all necessary dependencies. The browsers are installed automatically.

## Running Tests

### From the root directory:
```bash
# Run all e2e tests (requires servers to be running)
yarn test:e2e

# Run e2e setup tests (no servers required)
yarn test:e2e:setup

# Run e2e tests with UI mode
yarn test:e2e:ui

# Run e2e tests in headed mode (see browser)
yarn test:e2e:headed

# Run e2e tests in debug mode
yarn test:e2e:debug
```

### From the e2e package directory:
```bash
cd packages/e2e

# Run all tests (requires servers to be running)
yarn test

# Run setup tests (no servers required)
yarn test:setup

# Run tests with UI mode
yarn test:ui

# Run tests in headed mode
yarn test:headed

# Run tests in debug mode
yarn test:debug

# Generate tests with codegen
yarn test:codegen

# Show test report
yarn test:show-report
```

## Test Structure

- `tests/example.spec.ts` - Basic example tests
- `tests/app.spec.ts` - Main application workflow tests
- `tests-examples/` - Additional example tests from Playwright

## Configuration

The Playwright configuration (`playwright.config.ts`) is set up to:

1. **Start both API and web servers** before running tests
2. **Test across multiple browsers**: Chromium, Firefox, WebKit
3. **Test mobile responsiveness**: Mobile Chrome and Safari
4. **Capture screenshots and videos** on test failures
5. **Generate HTML reports** for test results

## Web Server Setup

The configuration automatically starts:
- **API server** on `http://localhost:3000`
- **Web server** on `http://localhost:5173`

Tests run against the web server as the base URL.

## Browser Support

Tests run on:
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome (Pixel 5), Safari (iPhone 12)

## CI/CD Integration

The tests are configured to:
- **Retry failed tests** on CI (2 retries)
- **Run in parallel** locally, but sequentially on CI
- **Fail on test.only** in CI environments
- **Generate traces** for debugging

## Best Practices

1. **Use semantic selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Test user workflows**: Focus on complete user journeys
3. **Mobile-first**: Ensure tests work on mobile devices
4. **Accessibility**: Test with screen readers and keyboard navigation
5. **API integration**: Test both frontend and backend together

## Debugging

### UI Mode
```bash
yarn test:ui
```
Opens Playwright's interactive UI for debugging tests.

### Debug Mode
```bash
yarn test:debug
```
Runs tests in debug mode with step-by-step execution.

### Code Generation
```bash
yarn test:codegen
```
Opens Playwright's code generator to record user actions.

### Trace Viewer
After a test run, view traces with:
```bash
yarn test:show-report
```

## Adding New Tests

1. Create new test files in the `tests/` directory
2. Use descriptive test names and group related tests with `test.describe()`
3. Follow the existing patterns for setup and assertions
4. Test both happy path and error scenarios
5. Include mobile responsiveness tests where applicable
