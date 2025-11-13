import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { TimeSlotsDto, PackageOptionDto, TreatOptionDto } from '@sweetly-dipped/shared-types';
import { ConfigController } from './config.controller.js';
import { ConfigService } from './config.service.js';

describe('ConfigController', () => {
  let controller: ConfigController;
  let service: ConfigService;

  beforeEach(() => {
    service = {
      getPackageOptions: vi.fn(),
      getTreatOptions: vi.fn(),
      getTimeSlots: vi.fn(),
      getUnavailablePeriods: vi.fn(),
    } as unknown as ConfigService;

    controller = new ConfigController(service);
  });

  describe('getPackages', () => {
    it('should return package options from service', async () => {
      const mockOptions: PackageOptionDto[] = [
        { id: 'small', label: 'Small', price: 110 },
      ];

      vi.mocked(service.getPackageOptions).mockResolvedValue(mockOptions);

      const result = await controller.getPackages();

      expect(result).toEqual(mockOptions);
      expect(service.getPackageOptions).toHaveBeenCalledOnce();
    });
  });

  describe('getTreats', () => {
    it('should return treat options from service', async () => {
      const mockOptions: TreatOptionDto[] = [
        { key: 'oreos', label: 'Oreos', price: 30 },
      ];

      vi.mocked(service.getTreatOptions).mockResolvedValue(mockOptions);

      const result = await controller.getTreats();

      expect(result).toEqual(mockOptions);
      expect(service.getTreatOptions).toHaveBeenCalledOnce();
    });
  });

  describe('getTimeSlots', () => {
    it('should return time slots from service', async () => {
      const mockSlots: TimeSlotsDto = {
        Sunday: [],
        Monday: [
          {
            startTime: { hour: 8, minute: 0, timeOfDay: 'morning' as const },
            endTime: { hour: 9, minute: 0, timeOfDay: 'morning' as const },
          },
        ],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
      };

      vi.mocked(service.getTimeSlots).mockResolvedValue(mockSlots);

      const result = await controller.getTimeSlots();

      expect(result).toEqual(mockSlots);
      expect(service.getTimeSlots).toHaveBeenCalledOnce();
    });
  });

  describe('getUnavailablePeriods', () => {
    it('should return unavailable periods from service', async () => {
      const mockPeriods = [
        {
          startDate: '2025-08-28',
          endDate: '2025-09-03',
          reason: 'Vacation',
        },
      ];

      vi.mocked(service.getUnavailablePeriods).mockResolvedValue(
        mockPeriods
      );

      const result = await controller.getUnavailablePeriods();

      expect(result).toEqual(mockPeriods);
      expect(service.getUnavailablePeriods).toHaveBeenCalledOnce();
    });
  });
});

