import type {
  FormData,
  PackageOptionDto,
  TreatOptionDto,
  TimeSlotsDto,
  UnavailablePeriodDto,
} from '@sweetly-dipped/shared-types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { vi } from 'vitest';

export const createMockFormData = (
  overrides: Partial<FormData> = {}
): FormData => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  communicationMethod: '',
  packageType: '',
  riceKrispies: 0,
  oreos: 0,
  pretzels: 0,
  marshmallows: 0,
  colorScheme: '',
  eventType: '',
  theme: '',
  selectedAdditionalDesigns: [],
  pickupDate: '',
  pickupTime: '',
  rushOrder: false,
  referralSource: '',
  termsAccepted: false,
  visitedSteps: new Set(['lead']),
  ...overrides,
});

export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

export const renderWithQueryClient = (
  ui: React.ReactElement
): RenderResult & { queryClient: QueryClient } => {
  const queryClient = createTestQueryClient();
  return {
    queryClient,
    ...render(
      React.createElement(QueryClientProvider, { client: queryClient }, ui)
    ),
  };
};

// Mock fixtures for config API
export const mockPackageOptions: PackageOptionDto[] = [
  { id: 'small', label: 'Small (3 dozen – 36 treats)', price: 110 },
  { id: 'medium', label: 'Medium (5 dozen – 60 treats)', price: 180 },
  { id: 'large', label: 'Large (8 dozen – 96 treats)', price: 280 },
  {
    id: 'xl',
    label: 'XL (12 dozen – 144 treats)',
    price: 420,
    description: 'Requires at least one month notice',
  },
  { id: 'by-dozen', label: 'No package — order by the dozen' },
];

export const mockTreatOptions: TreatOptionDto[] = [
  { key: 'riceKrispies', label: 'Chocolate covered Rice Krispies', price: 40 },
  { key: 'oreos', label: 'Chocolate covered Oreos', price: 30 },
  { key: 'pretzels', label: 'Chocolate dipped pretzels', price: 30 },
  {
    key: 'marshmallows',
    label: 'Chocolate covered marshmallow pops',
    price: 40,
  },
];

export const mockTimeSlots: TimeSlotsDto = {
  Sunday: [],
  Monday: [
    {
      startTime: { hour: 8, minute: 0, timeOfDay: 'morning' as const },
      endTime: { hour: 9, minute: 0, timeOfDay: 'morning' as const },
    },
    {
      startTime: { hour: 5, minute: 0, timeOfDay: 'evening' as const },
      endTime: { hour: 8, minute: 0, timeOfDay: 'evening' as const },
    },
  ],
  Tuesday: [
    {
      startTime: { hour: 8, minute: 0, timeOfDay: 'morning' as const },
      endTime: { hour: 9, minute: 0, timeOfDay: 'morning' as const },
    },
  ],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
};

export const mockUnavailablePeriods: UnavailablePeriodDto[] = [];

import type { AdditionalDesignOptionDto } from '@sweetly-dipped/shared-types';

export const mockAdditionalDesignOptions: AdditionalDesignOptionDto[] = [
  {
    id: 'design-1',
    name: 'Sprinkles',
    description: 'Custom sprinkles decoration',
    basePrice: 10,
    largePriceIncrease: 0,
    perDozenPrice: 8,
  },
  {
    id: 'design-2',
    name: 'Gold or silver painted',
    description: 'Elegant metallic paint accents',
    basePrice: 15,
    largePriceIncrease: 5,
    perDozenPrice: 12,
  },
];

// Helper to setup config API mocks
export const setupConfigMocks = (configApi: Record<string, unknown>) => {
  if (configApi.getPackageOptions) {
    vi.mocked(
      configApi.getPackageOptions as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockPackageOptions);
  }
  if (configApi.getTreatOptions) {
    vi.mocked(
      configApi.getTreatOptions as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockTreatOptions);
  }
  if (configApi.getTimeSlots) {
    vi.mocked(
      configApi.getTimeSlots as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockTimeSlots);
  }
  if (configApi.getUnavailablePeriods) {
    vi.mocked(
      configApi.getUnavailablePeriods as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockUnavailablePeriods);
  }
  if (configApi.getAdditionalDesignOptions) {
    vi.mocked(
      configApi.getAdditionalDesignOptions as ReturnType<typeof vi.fn>
    ).mockResolvedValue(mockAdditionalDesignOptions);
  }
};
