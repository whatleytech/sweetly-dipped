import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  usePackageOptions,
  useTreatOptions,
  useTimeSlots,
  useUnavailablePeriods,
} from './useConfigQuery';
import { configApi } from '@/api/configApi';
import type {
  PackageOptionDto,
  TreatOptionDto,
  TimeSlotsDto,
  UnavailablePeriodDto,
} from '@sweetly-dipped/shared-types';
import React from 'react';

vi.mock('@/api/configApi', () => ({
  configApi: {
    getPackageOptions: vi.fn(),
    getTreatOptions: vi.fn(),
    getTimeSlots: vi.fn(),
    getUnavailablePeriods: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useConfigQuery hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePackageOptions', () => {
    it('should fetch and return package options', async () => {
      const mockOptions: PackageOptionDto[] = [
        { id: 'small', label: 'Small', price: 110 },
        { id: 'medium', label: 'Medium', price: 180 },
      ];

      vi.mocked(configApi.getPackageOptions).mockResolvedValue(mockOptions);

      const { result } = renderHook(() => usePackageOptions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockOptions);
      expect(result.current.isError).toBe(false);
      expect(configApi.getPackageOptions).toHaveBeenCalledOnce();
    });

    it('should handle errors', async () => {
      const error = new Error('Failed to fetch');
      vi.mocked(configApi.getPackageOptions).mockRejectedValue(error);

      const { result } = renderHook(() => usePackageOptions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useTreatOptions', () => {
    it('should fetch and return treat options', async () => {
      const mockOptions: TreatOptionDto[] = [
        { key: 'oreos', label: 'Oreos', price: 30 },
        { key: 'pretzels', label: 'Pretzels', price: 30 },
      ];

      vi.mocked(configApi.getTreatOptions).mockResolvedValue(mockOptions);

      const { result } = renderHook(() => useTreatOptions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockOptions);
      expect(result.current.isError).toBe(false);
      expect(configApi.getTreatOptions).toHaveBeenCalledOnce();
    });
  });

  describe('useTimeSlots', () => {
    it('should fetch and return time slots', async () => {
      const mockSlots: TimeSlotsDto = {
        Monday: [
          {
            startTime: { hour: 8, minute: 0, timeOfDay: 'morning' },
            endTime: { hour: 9, minute: 0, timeOfDay: 'morning' },
          },
        ],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      };

      vi.mocked(configApi.getTimeSlots).mockResolvedValue(mockSlots);

      const { result } = renderHook(() => useTimeSlots(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockSlots);
      expect(result.current.isError).toBe(false);
      expect(configApi.getTimeSlots).toHaveBeenCalledOnce();
    });
  });

  describe('useUnavailablePeriods', () => {
    it('should fetch and return unavailable periods', async () => {
      const mockPeriods: UnavailablePeriodDto[] = [
        {
          startDate: '2025-08-28',
          endDate: '2025-09-03',
          reason: 'Vacation',
        },
      ];

      vi.mocked(configApi.getUnavailablePeriods).mockResolvedValue(
        mockPeriods
      );

      const { result } = renderHook(() => useUnavailablePeriods(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockPeriods);
      expect(result.current.isError).toBe(false);
      expect(configApi.getUnavailablePeriods).toHaveBeenCalledOnce();
    });
  });
});


