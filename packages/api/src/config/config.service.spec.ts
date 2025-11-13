import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigService } from './config.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('ConfigService', () => {
  let service: ConfigService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      packageOption: {
        findMany: vi.fn(),
      },
      treatOption: {
        findMany: vi.fn(),
      },
      timeSlot: {
        findMany: vi.fn(),
      },
      unavailablePeriod: {
        findMany: vi.fn(),
      },
    } as unknown as PrismaService;

    service = new ConfigService(prisma);
  });

  describe('getPackageOptions', () => {
    it('should return transformed package options', async () => {
      const mockOptions = [
        {
          packageId: 'small',
          label: 'Small (3 dozen – 36 treats)',
          description: null,
          price: 110,
          sortOrder: 1,
        },
        {
          packageId: 'by-dozen',
          label: 'No package — order by the dozen',
          description: null,
          price: null,
          sortOrder: 5,
        },
      ];

      vi.mocked(prisma.packageOption.findMany).mockResolvedValue(
        mockOptions as never
      );

      const result = await service.getPackageOptions();

      expect(result).toEqual([
        {
          id: 'small',
          label: 'Small (3 dozen – 36 treats)',
          description: undefined,
          price: 110,
        },
        {
          id: 'by-dozen',
          label: 'No package — order by the dozen',
          description: undefined,
          price: undefined,
        },
      ]);

      expect(prisma.packageOption.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('should return empty array when no active options exist', async () => {
      vi.mocked(prisma.packageOption.findMany).mockResolvedValue([]);

      const result = await service.getPackageOptions();

      expect(result).toEqual([]);
    });
  });

  describe('getTreatOptions', () => {
    it('should return transformed treat options', async () => {
      const mockOptions = [
        {
          treatKey: 'riceKrispies',
          label: 'Chocolate covered Rice Krispies',
          price: 40,
          sortOrder: 1,
        },
        {
          treatKey: 'oreos',
          label: 'Chocolate covered Oreos',
          price: 30,
          sortOrder: 2,
        },
      ];

      vi.mocked(prisma.treatOption.findMany).mockResolvedValue(
        mockOptions as never
      );

      const result = await service.getTreatOptions();

      expect(result).toEqual([
        {
          key: 'riceKrispies',
          label: 'Chocolate covered Rice Krispies',
          price: 40,
        },
        {
          key: 'oreos',
          label: 'Chocolate covered Oreos',
          price: 30,
        },
      ]);

      expect(prisma.treatOption.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('getTimeSlots', () => {
    it('should return grouped time slots by day of week', async () => {
      const mockSlots = [
        {
          dayOfWeek: 'Monday',
          startHour: 8,
          startMinute: 0,
          startTimeOfDay: 'morning',
          endHour: 9,
          endMinute: 0,
          endTimeOfDay: 'morning',
        },
        {
          dayOfWeek: 'Monday',
          startHour: 5,
          startMinute: 0,
          startTimeOfDay: 'evening',
          endHour: 8,
          endMinute: 0,
          endTimeOfDay: 'evening',
        },
        {
          dayOfWeek: 'Tuesday',
          startHour: 8,
          startMinute: 0,
          startTimeOfDay: 'morning',
          endHour: 9,
          endMinute: 0,
          endTimeOfDay: 'morning',
        },
      ];

      vi.mocked(prisma.timeSlot.findMany).mockResolvedValue(
        mockSlots as never
      );

      const result = await service.getTimeSlots();

      expect(result.Monday).toHaveLength(2);
      expect(result.Tuesday).toHaveLength(1);
      expect(result.Wednesday).toHaveLength(0);
      expect(result.Monday[0]).toEqual({
        startTime: {
          hour: 8,
          minute: 0,
          timeOfDay: 'morning',
        },
        endTime: {
          hour: 9,
          minute: 0,
          timeOfDay: 'morning',
        },
      });
    });

    it('should return all days with empty arrays when no slots exist', async () => {
      vi.mocked(prisma.timeSlot.findMany).mockResolvedValue([]);

      const result = await service.getTimeSlots();

      expect(result.Monday).toEqual([]);
      expect(result.Tuesday).toEqual([]);
      expect(result.Wednesday).toEqual([]);
      expect(result.Thursday).toEqual([]);
      expect(result.Friday).toEqual([]);
      expect(result.Saturday).toEqual([]);
      expect(result.Sunday).toEqual([]);
    });
  });

  describe('getUnavailablePeriods', () => {
    it('should return transformed unavailable periods', async () => {
      const mockPeriods = [
        {
          startDate: '2025-08-28',
          endDate: '2025-09-03',
          reason: 'Vacation',
        },
        {
          startDate: '2025-11-15',
          endDate: null,
          reason: 'Personal appointment',
        },
      ];

      vi.mocked(prisma.unavailablePeriod.findMany).mockResolvedValue(
        mockPeriods as never
      );

      const result = await service.getUnavailablePeriods();

      expect(result).toEqual([
        {
          startDate: '2025-08-28',
          endDate: '2025-09-03',
          reason: 'Vacation',
        },
        {
          startDate: '2025-11-15',
          endDate: undefined,
          reason: 'Personal appointment',
        },
      ]);

      expect(prisma.unavailablePeriod.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { startDate: 'asc' },
      });
    });
  });
});


