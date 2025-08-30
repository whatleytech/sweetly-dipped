# Sweetly Dipped Turborepo Migration Notes

## What Was Moved/Renamed

### Directory Structure Changes
- `/src` → `/packages/web/src`
- `/server` → `/packages/api/src`
- Root config files moved to shared packages

### New Package Structure
```
packages/
├── api/           # Express backend
├── web/           # Vite + React frontend
├── config-eslint/ # Shared ESLint configurations
└── config-ts/     # Shared TypeScript configurations
```

### Configuration Files
- `tsconfig.json` → `packages/config-ts/` (shared configs)
- `eslint.config.js` → `packages/config-eslint/` (shared configs)
- `vite.config.ts` → `packages/web/vite.config.ts`
- New: `turbo.json` (root Turborepo config)
- New: `tsconfig.base.json` (root TypeScript base config)

## Import Path Changes

### Web Package
All imports in `/packages/web/src/` now use `@/` alias:
- `../types/formTypes` → `@/types/formTypes`
- `../hooks/useFormData` → `@/hooks/useFormData`
- `../utils/formStepUtils` → `@/utils/formStepUtils`
- etc.

### API Package
All imports in `/packages/api/src/` now use `@/` alias:
- `./controllers/form-data-controller` → `@/controllers/form-data-controller`
- etc.

## Bootstrap Commands

### Fresh Install
```bash
yarn install
```

### Development
```bash
# Run both web and API in parallel
yarn dev

# Run only web frontend
yarn dev:web

# Run only API backend
yarn dev:api
```

## Build & Quality Commands

```bash
# Build all packages
yarn build

# Lint all packages
yarn lint

# Run tests across all packages
yarn test

# Type check all packages
yarn type-check

# Format code
yarn format

# Clean all build artifacts
yarn clean
```

## Package-Specific Commands

### Web Package
```bash
cd packages/web
yarn dev          # Start Vite dev server
yarn build        # Build for production
yarn test         # Run tests
yarn type-check   # TypeScript check
```

### API Package
```bash
cd packages/api
yarn dev          # Start API server with hot reload
yarn build        # Build TypeScript
yarn start        # Run built server
yarn test         # Run tests
```

## Key Benefits

1. **Isolated Dependencies**: Each package manages its own dependencies
2. **Shared Tooling**: Common ESLint and TypeScript configs
3. **Parallel Execution**: Turborepo runs tasks in parallel
4. **Caching**: Build artifacts are cached for faster rebuilds
5. **Type Safety**: Strict TypeScript across all packages
6. **Consistent Formatting**: Prettier configs in each package

## Current Status

✅ **Completed:**
- Monorepo structure created with packages/web, packages/api, packages/config-ts, packages/config-eslint, packages/shared-types
- Root turbo.json with proper task configuration
- All source files moved to appropriate packages
- Import paths updated to use `@/` aliases
- Shared types package created for FormData
- Dependencies properly configured with workspace references
- TypeScript configurations updated to ES2023 target and Node 22
- Module resolution set to "bundler" for modern bundler compatibility

⚠️ **Remaining Issues:**
- Some test files need mock data updates to include `visitedSteps` property
- API type serialization needs refinement
- Test globals configuration needs adjustment

## Troubleshooting

If you encounter issues:
1. Run `yarn clean` to clear all build artifacts
2. Delete `node_modules` and run `yarn install`
3. Check that all import paths use the `@/` alias
4. Ensure TypeScript compilation passes: `yarn type-check`
5. For test failures, ensure mock data includes all required FormData properties
