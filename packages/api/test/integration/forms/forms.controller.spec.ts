import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { faker } from '@faker-js/faker';
import { FormsModule } from '../../../src/forms/forms.module.js';
import { PrismaModule } from '../../../src/prisma/prisma.module.js';
import { PrismaService } from '../../../src/prisma/prisma.service.js';

describe('FormsController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, FormsModule],
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
    await prisma.order.deleteMany();
    await prisma.form.deleteMany();
    await prisma.customer.deleteMany();
  });

  describe('POST /forms', () => {
    it('should create a form and persist it in the database', async () => {
      // Arrange: Generate test data using Faker
      const createFormDto = {
        formData: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          communicationMethod: 'email' as const,
          packageType: 'medium' as const,
          riceKrispies: 0,
          oreos: 0,
          pretzels: 0,
          marshmallows: 0,
          colorScheme: faker.color.human(),
          eventType: faker.word.noun(),
          theme: faker.word.adjective(),
          additionalDesigns: faker.lorem.sentence(),
          pickupDate: faker.date.future().toISOString().split('T')[0],
          pickupTime: '10:00 AM',
          rushOrder: false,
          referralSource: faker.word.noun(),
          termsAccepted: true,
          visitedSteps: new Set(['lead', 'communication', 'package']),
        },
        currentStep: 2,
      };

      // Act: Make HTTP request
      const response = await request(app.getHttpServer())
        .post('/forms')
        .send(createFormDto)
        .expect(201);

      // Assert: Verify response structure
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('formData');
      expect(response.body.formData.email).toBe(createFormDto.formData.email);
      expect(response.body.currentStep).toBe(2);

      // Assert: Verify database persistence
      const formInDb = await prisma.form.findUnique({
        where: { id: response.body.id },
        include: { customer: true },
      });

      expect(formInDb).toBeDefined();
      const formData = formInDb!.data as { currentStep?: number };
      expect(formData).toMatchObject({
        currentStep: 2,
      });
      // Verify customer relationship
      expect(formInDb!.customer).toBeDefined();

      // Verify customer was created/upserted
      const customerInDb = await prisma.customer.findUnique({
        where: { email: createFormDto.formData.email },
      });
      expect(customerInDb).toBeDefined();
      expect(customerInDb!.email).toBe(createFormDto.formData.email);
    });
  });

  describe('GET /forms', () => {
    it('should return all forms', async () => {
      // Arrange: Create test forms
      const customer1 = await prisma.customer.create({
        data: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
        },
      });
      const customer2 = await prisma.customer.create({
        data: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
        },
      });

      await prisma.form.create({
        data: {
          customerId: customer1.id,
          communicationMethod: 'email',
          data: { currentStep: 1 },
        },
      });
      await prisma.form.create({
        data: {
          customerId: customer2.id,
          communicationMethod: 'text',
          data: { currentStep: 2 },
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/forms')
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('formData');
    });
  });

  describe('GET /forms/:id', () => {
    it('should return a form by id', async () => {
      // Arrange: Create test form
      const customer = await prisma.customer.create({
        data: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
        },
      });
      const form = await prisma.form.create({
        data: {
          customerId: customer.id,
          communicationMethod: 'email',
          data: { currentStep: 2 },
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get(`/forms/${form.id}`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('id', form.id);
      expect(response.body).toHaveProperty('formData');
    });

    it('should return 404 when form does not exist', async () => {
      // Arrange
      const nonExistentId = faker.string.uuid();

      // Act & Assert
      await request(app.getHttpServer())
        .get(`/forms/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('PUT /forms/:id', () => {
    it('should update a form', async () => {
      // Arrange: Create test form
      const customer = await prisma.customer.create({
        data: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
        },
      });
      const form = await prisma.form.create({
        data: {
          customerId: customer.id,
          communicationMethod: 'email',
          data: { currentStep: 1 },
        },
      });

      const updateDto = {
        formData: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: customer.email,
          phone: faker.phone.number(),
          communicationMethod: 'text' as const,
          packageType: 'large' as const,
          riceKrispies: 5,
          oreos: 3,
          pretzels: 2,
          marshmallows: 1,
          colorScheme: faker.color.human(),
          eventType: faker.word.noun(),
          theme: faker.word.adjective(),
          additionalDesigns: faker.lorem.sentence(),
          pickupDate: faker.date.future().toISOString().split('T')[0],
          pickupTime: '2:00 PM',
          rushOrder: true,
          referralSource: faker.word.noun(),
          termsAccepted: true,
          visitedSteps: new Set(['lead', 'communication', 'package', 'design']),
        },
        currentStep: 3,
      };

      // Act
      const response = await request(app.getHttpServer())
        .put(`/forms/${form.id}`)
        .send(updateDto)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('id', form.id);
      expect(response.body.currentStep).toBe(3);
      expect(response.body.formData.communicationMethod).toBe('text');
      expect(response.body.formData.packageType).toBe('large');

      // Verify database was updated
      const formInDb = await prisma.form.findUnique({
        where: { id: form.id },
      });
      expect(formInDb).toBeDefined();
      const data = formInDb!.data as { currentStep?: number };
      expect(data.currentStep).toBe(3);
    });

    it('should return 404 when form does not exist', async () => {
      // Arrange
      const nonExistentId = faker.string.uuid();
      const updateDto = {
        formData: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          communicationMethod: 'email' as const,
          packageType: 'medium' as const,
          riceKrispies: 0,
          oreos: 0,
          pretzels: 0,
          marshmallows: 0,
          colorScheme: '',
          eventType: '',
          theme: '',
          additionalDesigns: '',
          pickupDate: '',
          pickupTime: '',
          rushOrder: false,
          referralSource: '',
          termsAccepted: false,
          visitedSteps: new Set(['lead']),
        },
      };

      // Act & Assert
      await request(app.getHttpServer())
        .put(`/forms/${nonExistentId}`)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /forms/:id', () => {
    it('should delete a form', async () => {
      // Arrange: Create test form
      const customer = await prisma.customer.create({
        data: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
        },
      });
      const form = await prisma.form.create({
        data: {
          customerId: customer.id,
          communicationMethod: 'email',
          data: { currentStep: 1 },
        },
      });

      // Act
      await request(app.getHttpServer())
        .delete(`/forms/${form.id}`)
        .expect(204);

      // Assert: Verify form was deleted
      const formInDb = await prisma.form.findUnique({
        where: { id: form.id },
      });
      expect(formInDb).toBeNull();
    });

    it('should return 404 when form does not exist', async () => {
      // Arrange
      const nonExistentId = faker.string.uuid();

      // Act & Assert
      await request(app.getHttpServer())
        .delete(`/forms/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('POST /forms/:id/submit', () => {
    it('should submit a form and create an order', async () => {
      // Arrange: Create test form with customer
      const customer = await prisma.customer.create({
        data: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
        },
      });
      const form = await prisma.form.create({
        data: {
          customerId: customer.id,
          status: 'draft',
          communicationMethod: 'email',
          data: { currentStep: 3 },
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .post(`/forms/${form.id}/submit`)
        .expect(201);

      // Assert: Verify response
      expect(response.body).toHaveProperty('orderNumber');
      expect(response.body).toHaveProperty('submittedAt');
      expect(typeof response.body.orderNumber).toBe('string');
      expect(response.body.orderNumber.length).toBeGreaterThan(0);

      // Assert: Verify database state
      const formInDb = await prisma.form.findUnique({
        where: { id: form.id },
        include: { order: true },
      });
      expect(formInDb).toBeDefined();
      expect(formInDb!.status).toBe('submitted');
      expect(formInDb!.submittedAt).toBeDefined();
      expect(formInDb!.order).toBeDefined();
      expect(formInDb!.order!.orderNumber).toBe(response.body.orderNumber);

      // Verify order was created
      const orderInDb = await prisma.order.findUnique({
        where: { formId: form.id },
      });
      expect(orderInDb).toBeDefined();
      expect(orderInDb!.orderNumber).toBe(response.body.orderNumber);
    });

    it('should return 404 when form does not exist', async () => {
      // Arrange
      const nonExistentId = faker.string.uuid();

      // Act & Assert
      await request(app.getHttpServer())
        .post(`/forms/${nonExistentId}/submit`)
        .expect(404);
    });

    it('should return 400 when form is already submitted', async () => {
      // Arrange: Create submitted form
      const customer = await prisma.customer.create({
        data: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
        },
      });
      const form = await prisma.form.create({
        data: {
          customerId: customer.id,
          status: 'submitted',
          submittedAt: new Date(),
          communicationMethod: 'email',
          data: { currentStep: 3 },
        },
      });

      // Act & Assert
      await request(app.getHttpServer())
        .post(`/forms/${form.id}/submit`)
        .expect(400);
    });

    it('should return 400 when form has no customer', async () => {
      // Arrange: Create form without customer
      const form = await prisma.form.create({
        data: {
          status: 'draft',
          communicationMethod: 'email',
          data: { currentStep: 3 },
        },
      });

      // Act & Assert
      await request(app.getHttpServer())
        .post(`/forms/${form.id}/submit`)
        .expect(400);
    });
  });
});

