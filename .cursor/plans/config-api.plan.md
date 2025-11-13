<!-- 3f77b4cd-f1ed-4e0a-8867-f6e3124297ae 65869fc1-dd15-46ee-ae65-496ae39f4f15 -->
# Config API Migration Plan

## Backend Changes

### 1. Create Prisma Seed File

Create [`packages/api/prisma/seed.ts`](packages/api/prisma/seed.ts) to populate the four config tables with current hardcoded values from [`packages/web/src/constants/formData.ts`](packages/web/src/constants/formData.ts):

- `PackageOption` (5 options)
- `TreatOption` (4 treats)
- `TimeSlot` (14 time slots across 7 days)
- `UnavailablePeriod` (3 periods)

Add seed script to [`packages/api/package.json`](packages/api/package.json): `"seed": "tsx prisma/seed.ts"`

### 2. Create Shared Types

Create `packages/shared-types/configTypes.ts` with config DTOs that match frontend expectations:

- `PackageOptionDto`: Transform `packageId` → `id`, include all fields frontend needs
- `TreatOptionDto`: Transform `treatKey` → `key`, match frontend `TreatOption` interface
- `TimeSlotDto`: Match frontend `TimeSlot` structure with nested `Time` objects
- `TimeSlotsDto`: Grouped by day: `{ [dayOfWeek]: TimeSlotDto[] }`
- `UnavailablePeriodDto`: Match frontend `UnavailablePeriod` interface

Export all types from `packages/shared-types/index.ts`.

### 3. Create Config Module

Generate NestJS module at `packages/api/src/config/`:

- **Controller**: `config.controller.ts` with 4 GET endpoints:
- `GET /api/config/packages` - returns `PackageOptionDto[]`
- `GET /api/config/treats` - returns `TreatOptionDto[]`
- `GET /api/config/time-slots` - returns `TimeSlotsDto` (grouped by day)
- `GET /api/config/unavailable-periods` - returns `UnavailablePeriodDto[]`
- **Service**: `config.service.ts` with:
- Prisma queries (filter by `isActive=true`, order by `sortOrder`)
- **Transform functions** to convert Prisma models to shared DTOs
- Group time slots by `dayOfWeek` into frontend-expected structure
- **Module**: `config.module.ts` registering controller, service, and PrismaModule
- Register in [`packages/api/src/app.module.ts`](packages/api/src/app.module.ts)

**Key transformations**:

- `PackageOption.packageId` → `PackageOptionDto.id`
- `TreatOption.treatKey` → `TreatOptionDto.key`
- Flat `TimeSlot[]` → Grouped `TimeSlotsDto` by day of week

### 4. API Testing

Create `packages/api/src/config/config.service.spec.ts` and `config.controller.spec.ts` with unit tests covering all endpoints and edge cases (empty results, filtering, transformations).

## Frontend Changes

### 5. Create Config API Client

Add config methods to [`packages/web/src/api/formDataApi.ts`](packages/web/src/api/formDataApi.ts) (or create separate `configApi.ts`):

- `getPackageOptions()` - returns `PackageOptionDto[]`
- `getTreatOptions()` - returns `TreatOptionDto[]`
- `getTimeSlots()` - returns `TimeSlotsDto`
- `getUnavailablePeriods()` - returns `UnavailablePeriodDto[]`

### 6. Create React Query Hooks

Create `packages/web/src/hooks/useConfigQuery.ts` with individual hooks:

- `usePackageOptions()` - Returns `useQuery<PackageOptionDto[]>` with queryKey `['config', 'packages']`
- `useTreatOptions()` - Returns `useQuery<TreatOptionDto[]>` with queryKey `['config', 'treats']`
- `useTimeSlots()` - Returns `useQuery<TimeSlotsDto>` with queryKey `['config', 'time-slots']`
- `useUnavailablePeriods()` - Returns `useQuery<UnavailablePeriodDto[]>` with queryKey `['config', 'unavailable-periods']`

Configure with `staleTime: Infinity` since config data rarely changes. React Query is already configured in [`packages/web/src/main.tsx`](packages/web/src/main.tsx), no additional provider needed.

### 7. Update Components

Replace hardcoded imports with React Query hooks:

- [`packages/web/src/components/FormSteps/PackageSelection.tsx`](packages/web/src/components/FormSteps/PackageSelection.tsx) - use `usePackageOptions()`
- [`packages/web/src/components/FormSteps/ByTheDozen.tsx`](packages/web/src/components/FormSteps/ByTheDozen.tsx) - use `useTreatOptions()`
- [`packages/web/src/components/FormSteps/PickupDetails.tsx`](packages/web/src/components/FormSteps/PickupDetails.tsx) - use `useTimeSlots()` and `useUnavailablePeriods()`
- [`packages/web/src/utils/packageSummaryUtils.ts`](packages/web/src/utils/packageSummaryUtils.ts) - accept config as parameter (no hook in utils)
- [`packages/web/src/components/PackageDetails/PackageDetails.tsx`](packages/web/src/components/PackageDetails/PackageDetails.tsx) - use `useTreatOptions()` and `usePackageOptions()`

Handle loading/error states with React Query's built-in `isLoading`, `isError`, `error`, and `refetch`.

### 8. Frontend Testing

- Add tests for config query hooks using `@testing-library/react-hooks`
- Update existing component tests to mock React Query hooks with `QueryClientProvider` wrapper
- Test loading, error, and refetch states using React Query testing utilities

### 9. Cleanup

Remove exports from [`packages/web/src/constants/formData.ts`](packages/web/src/constants/formData.ts):

- `PACKAGE_OPTIONS`
- `TREAT_OPTIONS`
- `TIME_SLOTS`
- `UNAVAILABLE_PERIODS`

Keep `QUANTITIES` as it's not config data.

## Execution Steps

1. Run Prisma migrations if needed: `cd packages/api && yarn prisma migrate dev`
2. Run seed: `cd packages/api && yarn seed`
3. Start backend: `yarn dev` (from root or `packages/api`)
4. Verify endpoints with curl/Postman
5. Start frontend and verify config loads correctly
6. Run all tests: `yarn test`

### To-dos

- [ ] Create Prisma seed file with hardcoded config values
- [ ] Create shared types in packages/shared-types/configTypes.ts
- [ ] Create NestJS config module with controller, service, and DTOs
- [ ] Add unit tests for config service and controller
- [ ] Add config API methods to frontend API client
- [ ] Create React Query hooks for config data
- [ ] Update all components to use React Query hooks instead of imports
- [ ] Add tests for React Query hooks and update component tests
- [ ] Remove migrated constants from formData.ts
