import { mockDeep } from 'jest-mock-extended';
import { faker } from '@faker-js/faker';
import { ConfigService } from '../../../src/config/config.service.js';
import { PrismaService } from '../../../src/prisma/prisma.service.js';

describe('ConfigService', () => {
  let service: ConfigService;
  let prisma: ReturnType<typeof mockDeep<PrismaService>>;

  beforeEach(() => {
    prisma = mockDeep<PrismaService>();
    service = new ConfigService(prisma);
  });

  describe('getPackageOptions', () => {
    it('should return package options sorted by sortOrder', async () => {
      // Arrange
      const mockPackages = [
        {
          id: faker.string.uuid(),
          packageId: 'medium' as const,
          label: faker.commerce.productName(),
          description: faker.lorem.sentence(),
          price: faker.number.int({ min: 10, max: 100 }),
          isActive: true,
          sortOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: faker.string.uuid(),
          packageId: 'small' as const,
          label: faker.commerce.productName(),
          description: null,
          price: faker.number.int({ min: 10, max: 100 }),
          isActive: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: faker.string.uuid(),
          packageId: 'large' as const,
          label: faker.commerce.productName(),
          description: faker.lorem.sentence(),
          price: null,
          isActive: true,
          sortOrder: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Mock returns sorted by sortOrder (as Prisma would)
      const sortedPackages = [...mockPackages].sort((a, b) => a.sortOrder - b.sortOrder);
      prisma.packageOption.findMany.mockResolvedValue(sortedPackages);

      // Act
      const result = await service.getPackageOptions();

      // Assert
      expect(prisma.packageOption.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 'small',
        label: sortedPackages[0].label,
        description: undefined,
        price: sortedPackages[0].price ?? undefined,
      });
      expect(result[1]).toEqual({
        id: 'medium',
        label: sortedPackages[1].label,
        description: sortedPackages[1].description ?? undefined,
        price: sortedPackages[1].price ?? undefined,
      });
      expect(result[2]).toEqual({
        id: 'large',
        label: sortedPackages[2].label,
        description: sortedPackages[2].description ?? undefined,
        price: undefined,
      });
    });

    it('should only return active package options', async () => {
      // Arrange
      prisma.packageOption.findMany.mockResolvedValue([]);

      // Act
      await service.getPackageOptions();

      // Assert
      expect(prisma.packageOption.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('getTreatOptions', () => {
    it('should return treat options sorted by sortOrder', async () => {
      // Arrange
      const mockTreats = [
        {
          id: faker.string.uuid(),
          treatKey: 'oreos' as const,
          label: faker.commerce.productName(),
          price: faker.number.int({ min: 5, max: 50 }),
          isActive: true,
          sortOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: faker.string.uuid(),
          treatKey: 'riceKrispies' as const,
          label: faker.commerce.productName(),
          price: faker.number.int({ min: 5, max: 50 }),
          isActive: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Mock returns sorted by sortOrder (as Prisma would)
      const sortedTreats = [...mockTreats].sort((a, b) => a.sortOrder - b.sortOrder);
      prisma.treatOption.findMany.mockResolvedValue(sortedTreats);

      // Act
      const result = await service.getTreatOptions();

      // Assert
      expect(prisma.treatOption.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        key: 'riceKrispies',
        label: sortedTreats[0].label,
        price: sortedTreats[0].price,
      });
      expect(result[1]).toEqual({
        key: 'oreos',
        label: sortedTreats[1].label,
        price: sortedTreats[1].price,
      });
    });

    it('should only return active treat options', async () => {
      // Arrange
      prisma.treatOption.findMany.mockResolvedValue([]);

      // Act
      await service.getTreatOptions();

      // Assert
      expect(prisma.treatOption.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('getTimeSlots', () => {
    it('should return time slots grouped by day of week', async () => {
      // Arrange
      const mockSlots = [
        {
          id: faker.string.uuid(),
          dayOfWeek: 'Monday' as const,
          startHour: 9,
          startMinute: 0,
          startTimeOfDay: 'morning' as const,
          endHour: 12,
          endMinute: 0,
          endTimeOfDay: 'morning' as const,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: faker.string.uuid(),
          dayOfWeek: 'Monday' as const,
          startHour: 13,
          startMinute: 0,
          startTimeOfDay: 'morning' as const,
          endHour: 17,
          endMinute: 0,
          endTimeOfDay: 'evening' as const,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: faker.string.uuid(),
          dayOfWeek: 'Tuesday' as const,
          startHour: 10,
          startMinute: 30,
          startTimeOfDay: 'morning' as const,
          endHour: 14,
          endMinute: 30,
          endTimeOfDay: 'morning' as const,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prisma.timeSlot.findMany.mockResolvedValue(mockSlots);

      // Act
      const result = await service.getTimeSlots();

      // Assert
      expect(prisma.timeSlot.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startHour: 'asc' },
          { startMinute: 'asc' },
        ],
      });
      expect(result.Monday).toHaveLength(2);
      expect(result.Tuesday).toHaveLength(1);
      expect(result.Monday[0]).toEqual({
        startTime: {
          hour: 9,
          minute: 0,
          timeOfDay: 'morning',
        },
        endTime: {
          hour: 12,
          minute: 0,
          timeOfDay: 'morning',
        },
      });
      expect(result.Tuesday[0]).toEqual({
        startTime: {
          hour: 10,
          minute: 30,
          timeOfDay: 'morning',
        },
        endTime: {
          hour: 14,
          minute: 30,
          timeOfDay: 'morning',
        },
      });
    });

    it('should return all days of week with empty arrays for days without slots', async () => {
      // Arrange
      prisma.timeSlot.findMany.mockResolvedValue([]);

      // Act
      const result = await service.getTimeSlots();

      // Assert
      const days: Array<'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'> = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      for (const day of days) {
        expect(result[day]).toEqual([]);
      }
    });
  });

  describe('getUnavailablePeriods', () => {
    it('should return unavailable periods sorted by startDate', async () => {
      // Arrange
      const mockPeriods = [
        {
          id: faker.string.uuid(),
          startDate: '2024-12-25',
          endDate: '2024-12-26',
          reason: faker.lorem.sentence(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: faker.string.uuid(),
          startDate: '2024-11-28',
          endDate: null,
          reason: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: faker.string.uuid(),
          startDate: '2025-01-01',
          endDate: '2025-01-02',
          reason: faker.lorem.sentence(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Mock returns sorted by startDate (as Prisma would)
      const sortedPeriods = [...mockPeriods].sort((a, b) => a.startDate.localeCompare(b.startDate));
      prisma.unavailablePeriod.findMany.mockResolvedValue(sortedPeriods);

      // Act
      const result = await service.getUnavailablePeriods();

      // Assert
      expect(prisma.unavailablePeriod.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { startDate: 'asc' },
      });
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        startDate: '2024-11-28',
        endDate: undefined,
        reason: undefined,
      });
      expect(result[1]).toEqual({
        startDate: '2024-12-25',
        endDate: '2024-12-26',
        reason: sortedPeriods[1].reason ?? undefined,
      });
      expect(result[2]).toEqual({
        startDate: '2025-01-01',
        endDate: '2025-01-02',
        reason: sortedPeriods[2].reason ?? undefined,
      });
    });

    it('should only return active unavailable periods', async () => {
      // Arrange
      prisma.unavailablePeriod.findMany.mockResolvedValue([]);

      // Act
      await service.getUnavailablePeriods();

      // Assert
      expect(prisma.unavailablePeriod.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { startDate: 'asc' },
      });
    });
  });
});

