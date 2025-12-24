import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { faker } from '@faker-js/faker';
import { ConfigModule } from '../../../src/config/config.module.js';
import { PrismaModule } from '../../../src/prisma/prisma.module.js';
import { PrismaService } from '../../../src/prisma/prisma.service.js';

describe('ConfigController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, ConfigModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.unavailablePeriod.deleteMany();
    await prisma.timeSlot.deleteMany();
    await prisma.treatOption.deleteMany();
    await prisma.packageOption.deleteMany();
    await prisma.additionalDesignOption.deleteMany();
  });

  describe('GET /config/packages', () => {
    it('should return package options', async () => {
      // Arrange: Seed test data
      const packageOption = await prisma.packageOption.create({
        data: {
          packageId: 'medium',
          label: faker.commerce.productName(),
          description: faker.lorem.sentence(),
          price: faker.number.int({ min: 10, max: 100 }),
          isActive: true,
          sortOrder: 1,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/config/packages')
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const found = response.body.find(
        (p: { id: string; label: string }) => p.id === 'medium'
      );
      expect(found).toBeDefined();
      expect(found?.label).toBe(packageOption.label);
    });

    it('should only return active package options', async () => {
      // Arrange: Create active and inactive options
      await prisma.packageOption.create({
        data: {
          packageId: 'small',
          label: 'Small Package',
          isActive: true,
          sortOrder: 1,
        },
      });
      await prisma.packageOption.create({
        data: {
          packageId: 'large',
          label: 'Large Package',
          isActive: false,
          sortOrder: 2,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/config/packages')
        .expect(200);

      // Assert
      expect(response.body.every((p: { id: string }) => p.id !== 'large')).toBe(
        true
      );
    });
  });

  describe('GET /config/treats', () => {
    it('should return treat options', async () => {
      // Arrange: Seed test data
      const treatOption = await prisma.treatOption.create({
        data: {
          treatKey: 'oreos',
          label: faker.commerce.productName(),
          price: faker.number.int({ min: 5, max: 50 }),
          isActive: true,
          sortOrder: 1,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/config/treats')
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const found = response.body.find(
        (t: { key: string; label: string; price: number }) => t.key === 'oreos'
      );
      expect(found).toBeDefined();
      expect(found?.label).toBe(treatOption.label);
      expect(found?.price).toBe(treatOption.price);
    });

    it('should only return active treat options', async () => {
      // Arrange
      await prisma.treatOption.create({
        data: {
          treatKey: 'riceKrispies',
          label: 'Rice Krispies',
          price: 10,
          isActive: true,
          sortOrder: 1,
        },
      });
      await prisma.treatOption.create({
        data: {
          treatKey: 'pretzels',
          label: 'Pretzels',
          price: 12,
          isActive: false,
          sortOrder: 2,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/config/treats')
        .expect(200);

      // Assert
      expect(
        response.body.every((t: { key: string }) => t.key !== 'pretzels')
      ).toBe(true);
    });
  });

  describe('GET /config/time-slots', () => {
    it('should return time slots grouped by day', async () => {
      // Arrange: Seed test data
      await prisma.timeSlot.create({
        data: {
          dayOfWeek: 'Monday',
          startHour: 9,
          startMinute: 0,
          startTimeOfDay: 'morning',
          endHour: 12,
          endMinute: 0,
          endTimeOfDay: 'morning',
          isActive: true,
        },
      });
      await prisma.timeSlot.create({
        data: {
          dayOfWeek: 'Tuesday',
          startHour: 10,
          startMinute: 30,
          startTimeOfDay: 'morning',
          endHour: 14,
          endMinute: 30,
          endTimeOfDay: 'morning',
          isActive: true,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/config/time-slots')
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('Monday');
      expect(response.body).toHaveProperty('Tuesday');
      expect(Array.isArray(response.body.Monday)).toBe(true);
      expect(Array.isArray(response.body.Tuesday)).toBe(true);
      expect(response.body.Monday.length).toBeGreaterThan(0);
      expect(response.body.Tuesday.length).toBeGreaterThan(0);
      expect(response.body.Monday[0]).toHaveProperty('startTime');
      expect(response.body.Monday[0]).toHaveProperty('endTime');
    });

    it('should return all days of week with empty arrays', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/config/time-slots')
        .expect(200);

      // Assert
      const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      for (const day of days) {
        expect(response.body).toHaveProperty(day);
        expect(Array.isArray(response.body[day])).toBe(true);
      }
    });
  });

  describe('GET /config/unavailable-periods', () => {
    it('should return unavailable periods', async () => {
      // Arrange: Seed test data
      const period = await prisma.unavailablePeriod.create({
        data: {
          startDate: '2024-12-25',
          endDate: '2024-12-26',
          reason: faker.lorem.sentence(),
          isActive: true,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/config/unavailable-periods')
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const found = response.body.find(
        (p: { startDate: string; endDate?: string }) =>
          p.startDate === '2024-12-25'
      );
      expect(found).toBeDefined();
      expect(found?.endDate).toBe(period.endDate);
    });

    it('should only return active unavailable periods', async () => {
      // Arrange
      await prisma.unavailablePeriod.create({
        data: {
          startDate: '2024-11-28',
          isActive: true,
        },
      });
      await prisma.unavailablePeriod.create({
        data: {
          startDate: '2025-01-01',
          isActive: false,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/config/unavailable-periods')
        .expect(200);

      // Assert
      expect(
        response.body.every(
          (p: { startDate: string }) => p.startDate !== '2025-01-01'
        )
      ).toBe(true);
    });
  });

  describe('GET /config/additional-designs', () => {
    it('should return additional design options', async () => {
      // Arrange: Seed test data
      const designOption = await prisma.additionalDesignOption.create({
        data: {
          name: 'Sprinkles',
          description: 'Custom sprinkles decoration',
          basePrice: 10,
          largePriceIncrease: 0,
          perDozenPrice: null,
          isActive: true,
          sortOrder: 1,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/config/additional-designs')
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      const found = response.body.find(
        (o: { id: string; name: string }) => o.id === designOption.id
      );
      expect(found).toBeDefined();
      expect(found?.name).toBe(designOption.name);
      expect(found?.description).toBe(designOption.description);
      expect(found?.basePrice).toBe(designOption.basePrice);
      expect(found?.largePriceIncrease).toBe(designOption.largePriceIncrease);
    });

    it('should only return active additional design options', async () => {
      // Arrange: Create active and inactive options
      await prisma.additionalDesignOption.create({
        data: {
          name: 'Active Option',
          basePrice: 10,
          largePriceIncrease: 0,
          isActive: true,
          sortOrder: 1,
        },
      });
      await prisma.additionalDesignOption.create({
        data: {
          name: 'Inactive Option',
          basePrice: 20,
          largePriceIncrease: 0,
          isActive: false,
          sortOrder: 2,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/config/additional-designs')
        .expect(200);

      // Assert
      expect(
        response.body.every(
          (o: { name: string }) => o.name !== 'Inactive Option'
        )
      ).toBe(true);
    });

    it('should return options sorted by sortOrder', async () => {
      // Arrange
      await prisma.additionalDesignOption.create({
        data: {
          name: 'Second Option',
          basePrice: 20,
          largePriceIncrease: 0,
          isActive: true,
          sortOrder: 2,
        },
      });
      await prisma.additionalDesignOption.create({
        data: {
          name: 'First Option',
          basePrice: 10,
          largePriceIncrease: 0,
          isActive: true,
          sortOrder: 1,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/config/additional-designs')
        .expect(200);

      // Assert
      const firstIndex = response.body.findIndex(
        (o: { name: string }) => o.name === 'First Option'
      );
      const secondIndex = response.body.findIndex(
        (o: { name: string }) => o.name === 'Second Option'
      );
      expect(firstIndex).toBeLessThan(secondIndex);
    });
  });
});

